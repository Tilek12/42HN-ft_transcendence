import { WebSocket } from 'ws';
import { Player, GhostPlayer } from '../game/game-types';
import { userManager } from './user-manager';
import { gameManager } from './game-manager';
import {
    TournamentState,
    TournamentSize,
    TournamentStatus,
    Participant,
    Match
} from '../tournament/tournament-types';
import { sendTournamentUpdate } from '../routes/ws/presence-ws';
import { incrementWinsOrLossesOrTrophies } from '../database/profile';
import { createTournamentDB, joinTournamentDB } from '../database/tournament';

class OnlineTournamentManager {
    private nextTid = 1;
    private nextMid = 1;
    private nextUid = 2;

    private onlineTournaments = new Map<number, TournamentState>();
    private playerReadyStates = new Map<string, Set<number>>();

    // manage lobby timeouts + withdrawals
    private lobbyStartTimers = new Map<number, NodeJS.Timeout>();
    private withdrawnPlayerIdsByTournament = new Map<number, Set<number>>();

    private static readonly LOBBY_FILL_TIMEOUT_MS = 2 * 60 * 1000;
    private static readonly MATCH_START_DELAY_MS = 2000;

    /** Create a new online tournament */
    async createOnlineTournament(host: Participant, size: TournamentSize) {
        const id = this.nextTid++;
        const participants: Participant[] = [host];

        let tournament: TournamentState;
        this.onlineTournaments.set(
            id,
            (tournament = {
                id,
                size,
                hostId: host.id,
                status: 'waiting',
                participants,
                rounds: [],
                createdAt: Date.now()
            })
        );

        await createTournamentDB(`Tournament ${id}`, host.id);

        // Start a "fill by time or cancel" timer
        this.armLobbyFillTimeout(tournament.id);

        console.log(`🏆 [ONLINE Tournament: ${tournament.id}] Created by: `, host);
        sendTournamentUpdate();
        return tournament;
    }

    /** Join an existing online tournament */
    async joinOnlineTournament(id: number, participant: Participant) {
        const tournament = this.onlineTournaments.get(id);

        if (!tournament || tournament.status !== 'waiting') return null;
        if (tournament.participants.find(x => x.id === participant.id)) return tournament;
        if (tournament.participants.length >= tournament.size) return null;

        tournament.participants.push(participant);
        await joinTournamentDB(tournament.id, participant.id);

        console.log(`🏆 [ONLINE Tournament: ${id}] Participant joined: `, participant);

        sendTournamentUpdate();

        if (tournament.participants.length === tournament.size) {
            // full => start now, cancel timeout
            this.disarmLobbyFillTimeout(tournament.id);
            await this.startOnlineTournament(id);
        }

        return tournament;
    }

    /** Create the bracket and schedule round 1 */
    public async startOnlineTournament(id: number) {
        const tournament = this.onlineTournaments.get(id);
        if (!tournament) return;

        // Safety: only start when full
        if (tournament.status !== 'waiting') return;
        if (tournament.participants.length !== tournament.size) return;

        tournament.status = 'active';

        const seeded = [...tournament.participants];
        const round0: Match[] = [];
        for (let i = 0; i < seeded.length; i += 2) {
            round0.push(this.makeMatch(tournament, 0, seeded[i]!, seeded[i + 1]!));
        }

        tournament.rounds.push(round0);

        // unified logic: no special first-round barrier
        this.startRoundSimultaneously(tournament, 0);

        console.log(`🏆 [ONLINE Tournament: ${tournament.id}] Started`);
        sendTournamentUpdate();
    }

    /** Called by GameManager when one game ends */
    onMatchEnd(
        tournamentId: number,
        matchId: number,
        winner: Participant,
        loser: Participant,
        winnerScore: number,
        loserScore: number
    ) {
        const tournament = this.onlineTournaments.get(tournamentId);
        if (!tournament) return;

        const match = this.findMatch(tournament, matchId);
        if (!match) return;

        // Idempotency: ignore duplicate end events
        if (match.status === 'finished') return;

        match.status = 'finished';
        match.winnerId = winner.id;
        match.loserId = loser.id;
        match.winnerScore = winnerScore;
        match.loserScore = loserScore;

        const round = tournament.rounds[match.roundIndex];
        if (!round) return;

        // If all matches in this round finished, build next round or finish
        if (round.every(m => m.status === 'finished')) {
            const winners: Participant[] = round.map(m => {
                // IMPORTANT: derive from match participants, not tournament.participants
                if (m.winnerId === m.p1.id) return m.p1;
                if (m.winnerId === m.p2.id) return m.p2;
                // Fallback: shouldn’t happen, but avoid crashing
                return m.p1;
            });

            if (winners.length === 1) {
                tournament.status = 'finished';
                void incrementWinsOrLossesOrTrophies(winners[0]!.id, 'trophies');

                const finalWinner = winners[0]!;
                console.log(`🏆 [ONLINE Tournament: ${tournament.id}] Winner: ${finalWinner.id}`);

                this.sendToTournamentParticipants(tournament, {
                    type: 'onlineTournamentEnd',
                    winner: { id: finalWinner.id, name: finalWinner.name }
                });

                this.cleanupTournament(tournament.id);
                return;
            }

            const nextIdx = match.roundIndex + 1;
            const nextRound: Match[] = [];
            for (let i = 0; i < winners.length; i += 2) {
                nextRound.push(this.makeMatch(tournament, nextIdx, winners[i]!, winners[i + 1]!));
            }
            tournament.rounds.push(nextRound);

            this.startRoundSimultaneously(tournament, nextIdx);
        }
    }

    /** Start whole round "in parallel": notify each match and start/forfeit as needed */
    private startRoundSimultaneously(tournament: TournamentState, roundIdx: number) {
        const round = tournament.rounds[roundIdx];
        if (!round) return;

        round.forEach(match => this.startOneMatch(tournament, match));
    }

    /** Start one match: notify players, then either start game or forfeit (if someone withdrew) */
    private startOneMatch(tournament: TournamentState, match: Match) {
        // Don’t restart matches
        if (match.status === 'running' || match.status === 'finished') return;

        // If someone withdrew/disconnected, auto-forfeit immediately
        const withdrawn = this.withdrawnPlayerIdsByTournament.get(tournament.id);
        const p1Out = withdrawn?.has(match.p1.id) ?? false;
        const p2Out = withdrawn?.has(match.p2.id) ?? false;

        if (p1Out || p2Out) {
            if (p1Out && !p2Out) {
                this.notifyForfeitWin(tournament, match, match.p2, match.p1);
                this.onMatchEnd(tournament.id, match.id, match.p2, match.p1, 1, 0);
                return;
            }
            if (!p1Out && p2Out) {
                this.notifyForfeitWin(tournament, match, match.p1, match.p2);
                this.onMatchEnd(tournament.id, match.id, match.p1, match.p2, 1, 0);
                return;
            }
            // both out: tournament can’t proceed meaningfully; cancel tournament
            this.cancelTournament(tournament.id, 'insufficient_active_players');
            return;
        }

        match.status = 'waiting_for_sockets';

        this.sendMatchStart(tournament, match);

        // Start after 2 seconds (UI transition time). startActualMatch is idempotent.
        setTimeout(() => {
            this.startActualMatch(tournament.id, match);
        }, OnlineTournamentManager.MATCH_START_DELAY_MS);
    }

    /** Actually start the game */
    private startActualMatch(tournamentId: number, match: Match) {
        const tournament = this.onlineTournaments.get(tournamentId);
        if (!tournament) return;

        // Idempotency
        if (match.status === 'running' || match.status === 'finished') return;

        match.status = 'running';

        const toPlayer = (player: Participant) => {
            const user = userManager.getUser(player.id);
            if (!user || !user.onlineTournamentSocket) return GhostPlayer;
            return { id: player.id, name: player.name, socket: user.onlineTournamentSocket } as Player;
        };

        const player1 = toPlayer(match.p1);
        const player2 = toPlayer(match.p2);

        const game = gameManager.createGame('online-match', player1, player2, tournament.id, match.id);
        match.gameId = game.id;

        // Update sockets (same socket in your new design, but keep as-is)
        [match.p1, match.p2].forEach(p => {
            const user = userManager.getUser(p.id);
            if (user?.onlineTournamentSocket) {
                game.updateSocket({ id: p.id, name: p.name, socket: user.onlineTournamentSocket as any });
            }
        });
    }

    private makeMatch(t: TournamentState, roundIdx: number, p1: Participant, p2: Participant): Match {
        return { id: this.nextMid++, roundIndex: roundIdx, p1, p2, status: 'scheduled' };
    }

    private findMatch(tournament: TournamentState, matchId: number) {
        for (const round of tournament.rounds) {
            const match = round.find(x => x.id === matchId);
            if (match) return match;
        }
        return undefined;
    }

    getTournamentState(id: number) {
        const tournament = this.onlineTournaments.get(id);
        if (!tournament) return null;
        return {
            id: tournament.id,
            size: tournament.size,
            status: tournament.status,
            hostId: tournament.hostId,
            participants: tournament.participants.map(player => ({ id: player.id, name: player.name })),
            rounds: tournament.rounds.map(round =>
                round.map(match => ({
                    id: match.id,
                    status: match.status,
                    p1: match.p1.id,
                    p2: match.p2.id,
                    winnerId: match.winnerId
                }))
            )
        };
    }

    getOnlineTournaments() {
        return Array.from(this.onlineTournaments.values()).map(tournament => ({
            id: tournament.id,
            size: tournament.size,
            joined: tournament.participants.length,
            hostId: tournament.hostId,
            status: tournament.status,
            playerIds: tournament.participants.map(player => player.id)
        }));
    }

    getTournamentParticipant(userId: number): TournamentState | null {
        for (const tournament of this.onlineTournaments.values()) {
            if (tournament.participants.some(player => player.id === userId)) return tournament;
        }
        return null;
    }

    getGameForPlayer(playerId: number): any {
        const tournament = this.getTournamentParticipant(playerId);
        if (!tournament) return null;

        for (const round of tournament.rounds) {
            for (const match of round) {
                if (match.status === 'running' && (match.p1.id === playerId || match.p2.id === playerId)) {
                    return gameManager.getRoom(match.gameId!);
                }
            }
        }
        return null;
    }

    /** Keep for future use; now validates input (prevents bogus ready spam) */
    public playerSocketReady(tournamentId: number, matchId: number, playerId: number) {
        const tournament = this.onlineTournaments.get(tournamentId);
        if (!tournament) return;
        if (tournament.status !== 'active') return;

        const match = this.findMatch(tournament, matchId);
        if (!match) return;
        if (playerId !== match.p1.id && playerId !== match.p2.id) return;
        if (match.status === 'finished') return;

        const matchReadyKey = `${tournamentId}-${matchId}`;
        if (!this.playerReadyStates.has(matchReadyKey)) this.playerReadyStates.set(matchReadyKey, new Set());
        this.playerReadyStates.get(matchReadyKey)!.add(playerId);
    }

    quitOnlineTournament(userId: number) {
        const tournament = this.getTournamentParticipant(userId);
        if (!tournament) return;

        // Mark withdrawn for this tournament (auto-forfeit next match)
        let withdrawn = this.withdrawnPlayerIdsByTournament.get(tournament.id);
        if (!withdrawn) {
            withdrawn = new Set<number>();
            this.withdrawnPlayerIdsByTournament.set(tournament.id, withdrawn);
        }
        withdrawn.add(userId);

        // If active and currently in a running match => forfeit immediately
        if (tournament.status === 'active') {
            const runningMatch = this.findRunningMatchForPlayer(tournament, userId);
            if (runningMatch) {
                const opponent = runningMatch.p1.id === userId ? runningMatch.p2 : runningMatch.p1;
                this.notifyForfeitWin(
                    tournament,
                    runningMatch,
                    opponent,
                    runningMatch.p1.id === userId ? runningMatch.p1 : runningMatch.p2
                );
                this.onMatchEnd(tournament.id, runningMatch.id, opponent, { id: userId, name: '' }, 1, 0);
            }
        }

        // Remove from active participants list (your requirement: only active players)
        tournament.participants = tournament.participants.filter(p => p.id !== userId);

        // If empty => delete immediately.
        if (tournament.participants.length === 0) {
            this.cleanupTournament(tournament.id);

            // notify online list watchers
            this.notifyTournamentDeleted(tournament.id);
            sendTournamentUpdate();
            return;
        }

        sendTournamentUpdate();
    }

    // ---------------- helpers ----------------

    private sendToTournamentParticipants(tournament: TournamentState, payload: any) {
        const msg = JSON.stringify(payload);
        for (const participant of tournament.participants) {
            const user = userManager.getUser(Number(participant.id));
            if (user?.onlineTournamentSocket?.readyState === WebSocket.OPEN) {
                try {
                    user.onlineTournamentSocket.send(msg);
                } catch {
                    // ignore
                }
            }
        }
    }

    private sendMatchStart(tournament: TournamentState, match: Match) {
        const payload = {
            type: 'onlineMatchStart',
            tournamentId: tournament.id,
            tournamentSize: tournament.size,
            matchId: match.id,
            player1: { id: match.p1.id, name: match.p1.name },
            player2: { id: match.p2.id, name: match.p2.name }
        };

        [match.p1, match.p2].forEach(player => {
            const user = userManager.getUser(player.id);
            if (user?.onlineTournamentSocket?.readyState === WebSocket.OPEN) {
                try {
                    user.onlineTournamentSocket.send(JSON.stringify(payload));
                } catch {
                    // ignore
                }
            }
        });
    }

    private notifyForfeitWin(tournament: TournamentState, match: Match, winner: Participant, loser: Participant) {
        const payload = {
            type: 'onlineMatchForfeit',
            tournamentId: tournament.id,
            matchId: match.id,
            winner: { id: winner.id, name: winner.name },
            loser: { id: loser.id, name: loser.name || '' },
            reason: 'opponent_quit'
        };
        this.sendToTournamentParticipants(tournament, payload);
    }

    private findRunningMatchForPlayer(tournament: TournamentState, userId: number): Match | undefined {
        for (const round of tournament.rounds) {
            for (const match of round) {
                if (match.status === 'running' && (match.p1.id === userId || match.p2.id === userId)) {
                    return match;
                }
            }
        }
        return undefined;
    }

    private armLobbyFillTimeout(tournamentId: number) {
        this.disarmLobbyFillTimeout(tournamentId);
        const timer = setTimeout(() => {
            const tournament = this.onlineTournaments.get(tournamentId);
            if (!tournament) return;
            if (tournament.status !== 'waiting') return;
            // Not enough players to start precisely 4 or 8
            this.cancelTournament(tournamentId, 'not_enough_players_to_start');
        }, OnlineTournamentManager.LOBBY_FILL_TIMEOUT_MS);

        this.lobbyStartTimers.set(tournamentId, timer);
    }

    private disarmLobbyFillTimeout(tournamentId: number) {
        const timer = this.lobbyStartTimers.get(tournamentId);
        if (timer) clearTimeout(timer);
        this.lobbyStartTimers.delete(tournamentId);
    }

    private cancelTournament(tournamentId: number, reason: string) {
        const tournament = this.onlineTournaments.get(tournamentId);
        if (!tournament) return;

        // Notify currently active participants only
        this.sendToTournamentParticipants(tournament, {
            type: 'onlineTournamentCancelled',
            tournamentId,
            reason
        });

        this.cleanupTournament(tournamentId);
        sendTournamentUpdate();
    }

    private notifyTournamentDeleted(tournamentId: number) {
        const update = JSON.stringify({ type: 'onlineTournamentDeleted', id: tournamentId });

        for (const u of userManager.getOnlineUsers()) {
            const socket = userManager.getUser(u.id)?.onlineTournamentSocket;
            if (socket?.readyState === WebSocket.OPEN) {
                try {
                    socket.send(update);
                } catch {
                    // ignore
                }
            }
        }
    }

    private cleanupTournament(tournamentId: number) {
        this.disarmLobbyFillTimeout(tournamentId);
        this.withdrawnPlayerIdsByTournament.delete(tournamentId);

        // Remove any ready states for tournament
        for (const key of this.playerReadyStates.keys()) {
            if (key.startsWith(`${tournamentId}-`)) this.playerReadyStates.delete(key);
        }

        this.onlineTournaments.delete(tournamentId);
    }
}

export const onlineTournamentManager = new OnlineTournamentManager();
