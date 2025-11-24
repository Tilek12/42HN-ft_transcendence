import { WebSocket } from 'ws';
import { Player, GhostPlayer } from '../game/game-types';
import { userManager } from './user-manager';
import { gameManager } from './game-manager';
import {
	TournamentState,
	TournamentMode,
	TournamentSize,
	TournamentStatus,
	Participant,
	Match
} from '../tournament/tournament-types';
import { sendTournamentUpdate } from '../routes/ws/presence-ws';
import { incrementWinsOrLossesOrTrophies } from '../database/profile';
import { createTournamentDB, joinTournamentDB } from '../database/tournament';

class TournamentManager {
	private tournaments = new Map<string, TournamentState>();
	private nextTid = 1;  // Tournament ID starts at 1
	private nextMid = 1;  // Match ID starts at 1
	private nextUid = 2;  // User ID starts at 2 (1 is reserved for host)
	private localControlSocket = new Map<string, WebSocket>();
	private playerReadyStates = new Map<string, Set<string>>(); // matchKey -> Set<playerId>

	async createTournament(
		mode: TournamentMode,
		host: Participant,
		size: TournamentSize,
		localCtrlSocket?: WebSocket,
		extraNames: string[] = []
	) {
		const id = `t-${this.nextTid++}`;
		const participants: Participant[] = [];
		if (mode === 'online') {
			participants.push(host);
		} else if (mode === 'local') {
			for (const name of extraNames) {
				participants.push({
					id: `local-${this.nextUid++}`,
					name
				});
			}
			this.nextUid = 2; // reset for next local tournament
		}

		const tournament: TournamentState = {
			id,
			mode,
			size,
			hostId: host.id,
			status: 'waiting',
			participants,
			rounds: [],
			createdAt: Date.now()
		};
		this.tournaments.set(id, tournament);

		if (mode === 'local' && localCtrlSocket) {
			this.localControlSocket.set(id, localCtrlSocket);
		}

		if (mode === 'online') {
			await createTournamentDB(`Tournament ${id}`, Number(host.id));
		}
		// Local tournaments are not stored in DB

		console.log(`🏆 [Tournament: ${tournament.id}] Created with participants: `, participants);

		sendTournamentUpdate();
		return tournament;
	}

	async joinTournament(tournamentId: string, p: Participant) {
		const tournament = this.tournaments.get(tournamentId);
		if (!tournament || tournament.status !== 'waiting') return null;
		if (tournament.participants.find(x => x.id === p.id)) return tournament; // already joined
		if (tournament.participants.length >= tournament.size) return null;

		tournament.participants.push(p);
		if (tournament.mode === 'online') {
			await joinTournamentDB(Number(tournament.id.split('-')[1]), Number(p.id));
		}
		// Local tournaments don't store participants in DB

		sendTournamentUpdate();
		console.log(`🏆 [Tournament: ${tournamentId}] Player joined: ${p.id}`);

		if (tournament.participants.length === tournament.size)
			await this.startTournament(tournamentId);

		return tournament;
	}

	/** Create the bracket and schedule round 1 */
	public async startTournament(tournamentId: string) {
		const t = this.tournaments.get(tournamentId);
		if (!t) return;

		t.status = 'active';

		// Seed + pair (in join/creation order)
		const seeded = [...t.participants];
		const round0 = [];
		for (let i = 0; i < seeded.length; i += 2) {
			round0.push(this.makeMatch(t, 0, seeded[i]!, seeded[i + 1]!));
		}
		t.rounds.push(round0);

		// Start matches based on kind
		if (t.mode === 'online') this.startRoundSimultaneously(t, 0);
		else await this.startRoundSequentially(t, 0);

		console.log(`🏆 [Tournament: ${t.id}] Started`);
		sendTournamentUpdate();
		this.broadcastTournamentUpdate(t.id);
	}

	/** Called by GameManager when one game ends */
	onMatchEnd(
		tournamentId: string,
		matchId: string,
		winner: Participant,
		loser: Participant,
		winnerScore: number,
		loserScore: number
	) {
		const t = this.tournaments.get(tournamentId);
		if (!t) return;
		const match = this.findMatch(t, matchId);
		if (!match) return;

		match.status = 'finished';
		match.winnerId = winner.id;
		match.loserId = loser.id;
		match.winnerScore = winnerScore;
		match.loserScore = loserScore;

		// If all matches in this round finished, build next round or finish
		const round = t.rounds[match.roundIndex];
		if (round && round.every(m => m.status === 'finished')) {
			const winners = round
				.map(m => t.participants.find(p => p.id === m.winnerId)!)
				.filter(Boolean);

			if (winners.length === 1) {
				// tournament finished
				t.status = 'finished';
				if (t.mode === 'online') {
					void incrementWinsOrLossesOrTrophies(parseInt(winners[0]!.id), 'trophies');
				}
				// Local tournaments don't award trophies
				console.log(`🏆 [Tournament: ${t.id}] Winner: ${winners[0]!.id}`);

				// Send tournamentEnd message
				const winner = winners[0];
				if (t.mode === 'local') {
					const ctrlSocket = this.localControlSocket.get(t.id);
					if (ctrlSocket) {
						ctrlSocket.send(JSON.stringify({
							type: 'tournamentEnd',
							winner: { id: winner!.id, name: winner!.name }
						}));
					}
				} else {
					// Online: broadcast to participants
					for (const p of t.participants) {
						const u = userManager.getUser(Number(p.id));
						if (u && u.tournamentSocket?.readyState === WebSocket.OPEN) {
							u.tournamentSocket.send(JSON.stringify({
								type: 'tournamentEnd',
								winner: { id: winner!.id, name: winner!.name }
							}));
						}
					}
				}

				this.broadcastTournamentUpdate(t.id);
				return;
			}

			// Next round
			const nextIdx = match.roundIndex + 1;
			const nextRound: Match[] = [];
			for (let i = 0; i < winners.length; i += 2) {
				nextRound.push(this.makeMatch(t, nextIdx, winners[i]!, winners[i + 1]!));
			}
			t.rounds.push(nextRound);

			if (t.mode === 'online') this.startRoundSimultaneously(t, nextIdx);
			else this.startRoundSequentially(t, nextIdx);
		}

		this.broadcastTournamentUpdate(t.id);
	}

	/** Local tournaments: start matches one-by-one on the same computer */
	private async startRoundSequentially(t: TournamentState, roundIdx: number) {
		const ctrlSocket = this.localControlSocket.get(t.id);
		for (const m of t.rounds[roundIdx]!) {
			await this.startOneMatch(t, m, ctrlSocket); // await: resolves when game ends
		}
	}

	/** Online tournaments: start whole round in parallel with staggered starts */
	private startRoundSimultaneously(t: TournamentState, roundIdx: number) {
		if (roundIdx === 0) {
			// First round: wait for ALL players to be ready, then start all matches simultaneously
			this.startFirstRoundSimultaneously(t);
		} else {
			// Subsequent rounds: stagger matches to prevent server overload
			const baseDelay = 4000; // 4s base delay for subsequent rounds
			t.rounds[roundIdx]!.forEach((match, index) => {
				const delay = baseDelay + (index * 500); // 500ms stagger between matches
				setTimeout(() => this.startOneMatch(t, match), delay);
			});
		}
	}

	/** Wait for all players in first round to be ready, then start all matches simultaneously */
	private startFirstRoundSimultaneously(t: TournamentState) {
		const round = t.rounds[0];
		if (!round) return;

		// Send matchStart to all players in the first round
		round.forEach(match => {
			[match.p1, match.p2].forEach(player => {
				const user = userManager.getUser(Number(player.id));
				if (user && user.tournamentSocket?.readyState === WebSocket.OPEN) {
					user.tournamentSocket.send(JSON.stringify({
						type: 'matchStart',
						tournamentId: t.id,
						size: t.size,
						player1: match.p1.id,
						player2: match.p2.id,
						matchId: match.id
					}));
				}
			});
		});

		// Wait for ALL tournament participants to signal readiness
		this.waitForAllPlayersReady(t.id, round);
	}

	/** Wait for all tournament players to be ready before starting first round matches */
	private waitForAllPlayersReady(tournamentId: string, matches: Match[]) {
		const readyKey = `${tournamentId}-round0`;
		const expectedPlayers = new Set(matches.flatMap(m => [m.p1.id, m.p2.id]));
		const timeout = 15000; // 15 second timeout for first round
		const startTime = Date.now();

		const checkReady = () => {
			const readyPlayers = this.playerReadyStates.get(readyKey)?.size || 0;

			if (readyPlayers >= expectedPlayers.size) {
				// All players ready, start all matches simultaneously
				matches.forEach(match => {
					this.startActualMatch(tournamentId, match);
				});
				this.playerReadyStates.delete(readyKey);
				console.log(`🎮 [Tournament ${tournamentId}] All first round matches started simultaneously`);
				return;
			}

			if (Date.now() - startTime > timeout) {
				// Timeout - start with whoever is ready
				console.warn(`⏰ [Tournament ${tournamentId}] Timeout waiting for all players (${readyPlayers}/${expectedPlayers.size} ready), starting available matches`);
				matches.forEach(match => {
					const matchReadyPlayers = this.playerReadyStates.get(`${tournamentId}-${match.id}`)?.size || 0;
					if (matchReadyPlayers === 2) {
						this.startActualMatch(tournamentId, match);
					}
				});
				this.playerReadyStates.delete(readyKey);
				return;
			}

			// Check again in 100ms
			setTimeout(checkReady, 100);
		};

		checkReady();
	}

	/** Start one match, wire onEnd → TournamentManager.onMatchEnded */
	private startOneMatch(t: TournamentState, match: Match, localSocket?: WebSocket) {
		match.status = 'waiting_for_sockets';

		if (t.mode === 'local' && localSocket) {
			localSocket.send(JSON.stringify({
				type: 'matchStart',
				tournamentId: t.id,
				matchId: match.id,
				p1: { id: match.p1.id, name: match.p1.name },
				p2: { id: match.p2.id, name: match.p2.name }
			}));
			// For local tournaments, start immediately since socket is ready
			this.startActualMatch(t.id, match, localSocket);
		} else if (t.mode === 'online') {
			// Send matchStart to both players' tournament sockets
			[match.p1, match.p2].forEach(player => {
				const user = userManager.getUser(Number(player.id));
				if (user?.tournamentSocket?.readyState === WebSocket.OPEN) {
					user.tournamentSocket.send(JSON.stringify({
						type: 'matchStart',
						tournamentId: t.id,
						size: t.size,
						player1: match.p1.id,
						player2: match.p2.id,
						matchId: match.id
					}));
				}
			});
			// Wait for players to signal socket readiness
			this.waitForPlayerSockets(t.id, match);
		}
	}

	/** Wait for both players to signal their game sockets are ready */
	private waitForPlayerSockets(tournamentId: string, match: Match) {
		const readyKey = `${tournamentId}-${match.id}`;
		const timeout = 10000; // 10 second timeout
		const startTime = Date.now();

		const checkReady = () => {
			const readyPlayers = this.playerReadyStates.get(readyKey)?.size || 0;

			if (readyPlayers === 2) {
				// Both players ready, start the actual game
				this.startActualMatch(tournamentId, match);
				this.playerReadyStates.delete(readyKey);
				return;
			}

			if (Date.now() - startTime > timeout) {
				// Timeout - force start with available sockets
				console.warn(`⏰ [Tournament ${tournamentId}] Timeout waiting for sockets in match ${match.id}, starting with ${readyPlayers}/2 ready`);
				this.startActualMatch(tournamentId, match);
				this.playerReadyStates.delete(readyKey);
				return;
			}

			// Check again in 100ms
			setTimeout(checkReady, 100);
		};

		checkReady();
	}

	/** Actually start the game after socket readiness is confirmed */
	private startActualMatch(tournamentId: string, match: Match, localSocket?: WebSocket) {
		const t = this.tournaments.get(tournamentId);
		if (!t) return;

		match.status = 'running';

		const toPlayer = (p: Participant) => {
			// Online: use each user's game socket from userManager
			// Local: both players share the same localSocket
			if (t.mode === 'local' && localSocket) {
				return { id: p.id, name: p.name, socket: localSocket } as Player;
			}
			const u = userManager.getUser(Number(p.id));
			if (!u) {
				// Fall back to ghost socket to avoid crash; will be updated when game socket connects
				return GhostPlayer;
			}
			else {
				return { id: p.id, name: p.name, socket: u.gameSocket } as Player;
			}
		};

		const p1 = toPlayer(match.p1);
		const p2 = toPlayer(match.p2);

		const game = gameManager.createGame(
			t.mode === 'local' ? 'local' : 'duel', // local tournaments use local mode
			p1,
			p2,
			t.id,
			match.id
		);

		match.gameId = game.id;

		// For online tournaments, update sockets if players already connected their game sockets
		if (t.mode === 'online') {
			[match.p1, match.p2].forEach(p => {
				const user = userManager.getUser(Number(p.id));
				if (user?.gameSocket) {
					game.updateSocket({ id: p.id, name: p.name, socket: user.gameSocket as any });
				}
			});
		}

		// Return a promise for local sequential flow
		if (t.mode === 'local') {
			return new Promise<void>((resolve) => {
				game.onEndCallback((winner, loser, ws, ls) => {
					this.onMatchEnd(t.id, match.id, { id: winner.id, name: winner.name }, { id: loser.id, name: loser.name }, ws, ls);
					resolve();
				});
			});
		}
		console.log(`🎮 [Tournament ${t.id}] Match started: ${match.id}`);
	}

	private makeMatch(t: TournamentState, roundIdx: number, p1: Participant, p2: Participant): Match {
		return {
			id: `m-${this.nextMid++}`,
			roundIndex: roundIdx,
			p1,
			p2,
			status: 'scheduled'
		};
		// (Persist: create match row linked to tournamentId)
	}

	private findMatch(t: TournamentState, matchId: string) {
		for (const r of t.rounds) {
			const m = r.find(x => x.id === matchId);
			if (m) return m;
		}
		return undefined;
	}

	// private shuffle<T>(arr: T[]) {
	// 	for (let i = arr.length - 1; i > 0; i--) {
	// 		const j = (Math.random() * (i + 1)) | 0;
	// 		[arr[i], arr[j]] = [arr[j], arr[i]];
	// 	}
	// 	return arr;
	// }

	/** push updates to UIs (tournament lobby + participants) */
	private broadcastTournamentUpdate(tournamentId: string) {
		const t = this.tournaments.get(tournamentId);
		if (!t) return;
		const update = JSON.stringify({
			type: 'tournamentUpdate',
			state: this.getSafeState(t.id)
		});

		for (const p of t.participants) {
			const u = userManager.getUser(Number(p.id));
			if (u?.tournamentSocket?.readyState === WebSocket.OPEN) {
				u.tournamentSocket.send(update);
			}
		}
	}

	getSafeState(id: string) {
		const t = this.tournaments.get(id);
		if (!t) return null;
		return {
			id: t.id,
			mode: t.mode,
			size: t.size,
			status: t.status,
			hostId: t.hostId,
			participants: t.participants.map(p => ({ id: p.id, name: p.name })),
			rounds: t.rounds.map(r => r.map(m => ({
				id: m.id, status: m.status, p1: m.p1.id, p2: m.p2.id, winnerId: m.winnerId
			})))
		};
	}

	getSafeTournamentData() {
		return Array.from(this.tournaments.values())
			.filter(t => t.mode === 'online')
			.map(t => ({
				id: t.id,
				size: t.size,
				joined: t.participants.length,
				hostId: t.hostId,
				status: t.status,
				playerIds: t.participants.map(p => p.id)
			}));
	}

	getUserTournament(userId: string): TournamentState | null {
		for (const t of this.tournaments.values()) {
			if (t.participants.some(p => p.id === userId)) return t;
		}
		return null;
	}

	getTournamentMode(tournamentId: string): 'local' | 'online' | null {
		const t = this.tournaments.get(tournamentId);
		return t ? t.mode : null;
	}

	getGameForPlayer(playerId: string): any {
		const tournament = this.getUserTournament(playerId);
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

	/** Handle player socket ready signal */
	public playerSocketReady(tournamentId: string, matchId: string, playerId: string) {
		// Handle both individual match readiness and round-wide readiness
		const matchReadyKey = `${tournamentId}-${matchId}`;
		const roundReadyKey = `${tournamentId}-round0`;

		// Always track individual match readiness
		if (!this.playerReadyStates.has(matchReadyKey)) {
			this.playerReadyStates.set(matchReadyKey, new Set());
		}
		this.playerReadyStates.get(matchReadyKey)!.add(playerId);

		// For first round, also track round-wide readiness
		const tournament = this.tournaments.get(tournamentId);
		if (tournament && tournament.rounds.length > 0 && tournament.rounds[0]!.some(m => m.id === matchId)) {
			if (!this.playerReadyStates.has(roundReadyKey)) {
				this.playerReadyStates.set(roundReadyKey, new Set());
			}
			this.playerReadyStates.get(roundReadyKey)!.add(playerId);
		}

		console.log(`🎯 [Tournament ${tournamentId}] Player ${playerId} ready for match ${matchId}`);
	}

	quitTournament(userId: string) {
		const t = this.getUserTournament(userId);
		if (!t) return;

		// Remove the user from the tournament participants
		t.participants = t.participants.filter(p => p.id !== userId);
		console.log(`❌ [Tournament: ${t.id}] Player quit: ${userId}`);

		// Check if the tournament is empty
		if (t.participants.length === 0) {
			// Delete the tournament
			this.tournaments.delete(t.id);
			console.log(`🗑 [Tournament: ${t.id}] Empty tournament deleted`);

			// Remove local control socket if it's a local tournament
			if (t.mode === 'local') {
				this.localControlSocket.delete(t.id);
			}

			// Notify all clients about the tournament deletion
			const update = JSON.stringify({
				type: 'tournamentDeleted',
				id: t.id
			});
			for (const u of userManager.getOnlineUsers()) {
				const socket = userManager.getUser(u.id)?.tournamentSocket;
				if (socket?.readyState === WebSocket.OPEN) {
					try {
						socket.send(update);
					} catch (err) {
						console.warn(`⚠️ [Tournament Manager] Failed to notify user ${u.id} about tournament deletion:`, err);
					}
				}
			}

			// Send updated tournament list to all clients
			sendTournamentUpdate();
			return;
		}

		sendTournamentUpdate();
		// If the tournament is not empty, broadcast the update
		// this.broadcastTournamentUpdate(t.id);
	}
}

export const tournamentManager = new TournamentManager();
