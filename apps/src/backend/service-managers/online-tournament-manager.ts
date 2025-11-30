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
	private nextTid = 1;  // Tournament ID starts at 1
	private nextMid = 1;  // Match ID starts at 1
	private nextUid = 2;  // User ID starts at 2 (1 is reserved for host)
	private onlineTournaments = new Map<string, TournamentState>();  // all active online tournaments
	private playerReadyStates = new Map<string, Set<string>>();  // matchKey -> Set<playerId>

	/** Create a new online tournament */
	async createOnlineTournament(
		host: Participant,
		size: TournamentSize,
	) {
		const id = `t-online-${this.nextTid++}`;
		let participants: Participant[] = [];
		let tournament: TournamentState;

		participants.push(host);

		this.onlineTournaments.set(id, tournament = {
			id,
			size,
			hostId: host.id,
			status: 'waiting',
			participants: participants,
			rounds: [],
			createdAt: Date.now()
		});

		await createTournamentDB(`Tournament ${id}`, parseInt(host.id));

		console.log(`🏆 [ONLINE Tournament: ${tournament.id}] Created by: `, host);

		sendTournamentUpdate();
		return tournament;
	}

	/** Join an existing online tournament */
	async joinOnlineTournament(id: string, participant: Participant) {
		const tournament = this.onlineTournaments.get(id);

		if (!tournament || tournament.status !== 'waiting') return null;
		if (tournament.participants.find(x => x.id === participant.id)) return tournament; // already joined
		if (tournament.participants.length >= tournament.size) return null;

		tournament.participants.push(participant);
		await joinTournamentDB(Number(tournament.id.split('-')[1]), Number(participant.id));

		console.log(`🏆 [ONLINE Tournament: ${id}] Participant joined: `, participant);

		sendTournamentUpdate();

		if (tournament.participants.length === tournament.size)
			await this.startOnlineTournament(id);

		return tournament;
	}

	/** Create the bracket and schedule round 1 */
	public async startOnlineTournament(id: string) {
		const tournament = this.onlineTournaments.get(id);

		if (!tournament) return;

		tournament.status = 'active';

		// Seed + pair (in join/creation order)
		const seeded = [...tournament.participants];
		const round0: Match[] = [];

		for (let i = 0; i < seeded.length; i += 2) {
			round0.push(this.makeMatch(tournament, 0, seeded[i]!, seeded[i + 1]!));
		}

		tournament.rounds.push(round0);
		this.startRoundSimultaneously(tournament, 0);

		console.log(`🏆 [ONLINE Tournament: ${tournament.id}] Started`);

		sendTournamentUpdate();
		this.broadcastTournamentUpdate(tournament.id);
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
		const tournament = this.onlineTournaments.get(tournamentId);
		if (!tournament) return;
		const match = this.findMatch(tournament, matchId);
		if (!match) return;

		match.status = 'finished';
		match.winnerId = winner.id;
		match.loserId = loser.id;
		match.winnerScore = winnerScore;
		match.loserScore = loserScore;

		// If all matches in this round finished, build next round or finish
		const round = tournament.rounds[match.roundIndex];
		if (round && round.every(match => match.status === 'finished')) {
			const winners = round
				.map(match => tournament.participants.find(participant => participant.id === match.winnerId)!)
				.filter(Boolean);

			if (winners.length === 1) {
				// tournament finished
				tournament.status = 'finished';
				void incrementWinsOrLossesOrTrophies(parseInt(winners[0]!.id), 'trophies');

				console.log(`🏆 [ONLINE Tournament: ${tournament.id}] Winner: ${winners[0]!.id}`);

				// Send tournamentEnd message
				const winner = winners[0];
				// Online: broadcast to participants
				for (const participant of tournament.participants) {
					const user = userManager.getUser(Number(participant.id));
					if (user && user.tournamentSocket?.readyState === WebSocket.OPEN) {
						user.tournamentSocket.send(JSON.stringify({
							type: 'tournamentEnd',
							winner: { id: winner!.id, name: winner!.name }
						}));
					}
				}

				this.broadcastTournamentUpdate(tournament.id);
				return;
			}

			// Next round
			const nextIdx = match.roundIndex + 1;
			const nextRound: Match[] = [];
			for (let i = 0; i < winners.length; i += 2) {
				nextRound.push(this.makeMatch(tournament, nextIdx, winners[i]!, winners[i + 1]!));
			}
			tournament.rounds.push(nextRound);

			this.startRoundSimultaneously(tournament, nextIdx);
		}

		this.broadcastTournamentUpdate(tournament.id);
	}

	/** Online tournaments: start whole round in parallel with staggered starts */
	private startRoundSimultaneously(tournament: TournamentState, roundIdx: number) {
		if (roundIdx === 0) {
			// First round: wait for ALL players to be ready, then start all matches simultaneously
			this.startFirstRoundSimultaneously(tournament);
		} else {
			// Subsequent rounds: stagger matches to prevent server overload
			const baseDelay = 4000; // 4s base delay for subsequent rounds
			tournament.rounds[roundIdx]!.forEach((match, index) => {
				const delay = baseDelay + (index * 500); // 500ms stagger between matches
				setTimeout(() => this.startOneMatch(tournament, match), delay);
			});
		}
	}

	/** Wait for all players in first round to be ready, then start all matches simultaneously */
	private startFirstRoundSimultaneously(tournament: TournamentState) {
		const round = tournament.rounds[0];
		if (!round) return;

		// Send matchStart to all players in the first round
		round.forEach(match => {
			[match.p1, match.p2].forEach(player => {
				const user = userManager.getUser(Number(player.id));
				if (user && user.tournamentSocket?.readyState === WebSocket.OPEN) {
					user.tournamentSocket.send(JSON.stringify({
						type: 'matchStart',
						tournamentId: tournament.id,
						tournamentSize: tournament.size,
						matchId: match.id,
						player1: { id: match.p1.id, name: match.p1.name },
						player2: { id: match.p2.id, name: match.p2.name }
					}));
				}
			});
		});

		// Wait for ALL tournament participants to signal readiness
		this.waitForAllPlayersReady(tournament.id, round);
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
				console.log(`🎮 [ONLINE Tournament ${tournamentId}] All first round matches started simultaneously`);
				return;
			}

			if (Date.now() - startTime > timeout) {
				// Timeout - start with whoever is ready
				console.warn(`⏰ [ONLINE Tournament ${tournamentId}] Timeout waiting for all players (${readyPlayers}/${expectedPlayers.size} ready), starting available matches`);
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
	private startOneMatch(tournament: TournamentState, match: Match) {
		match.status = 'waiting_for_sockets';

		// Send matchStart to both players' tournament sockets
		[match.p1, match.p2].forEach(player => {
			const user = userManager.getUser(Number(player.id));
			if (user?.tournamentSocket?.readyState === WebSocket.OPEN) {
				user.tournamentSocket.send(JSON.stringify({
					type: 'matchStart',
					tournamentId: tournament.id,
					tournamentSize: tournament.size,
					matchId: match.id,
					player1: { id: match.p1.id, name: match.p1.name },
					player2: { id: match.p2.id, name: match.p2.name }
				}));
			}
		});

		// Wait for players to signal socket readiness
		this.waitForPlayerSockets(tournament.id, match);
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
	private startActualMatch(tournamentId: string, match: Match) {
		const tournament = this.onlineTournaments.get(tournamentId);
		if (!tournament) return;

		match.status = 'running';

		const toPlayer = (player: Participant) => {
			// Online: use each user's game socket from userManager
			const user = userManager.getUser(Number(player.id));
			if (!user) {
				// Fall back to ghost socket to avoid crash; will be updated when game socket connects
				return GhostPlayer;
			}
			else {
				return { id: player.id, name: player.name, socket: user.gameSocket } as Player;
			}
		};

		const player1 = toPlayer(match.p1);
		const player2 = toPlayer(match.p2);

		const game = gameManager.createGame(
			'online-match',
			player1,
			player2,
			tournament.id,
			match.id
		);

		match.gameId = game.id;

		// For online tournaments, update sockets if players already connected their game sockets
		[match.p1, match.p2].forEach(p => {
			const user = userManager.getUser(Number(p.id));
			if (user?.gameSocket) {
				game.updateSocket({ id: p.id, name: p.name, socket: user.gameSocket as any });
			}
		});

		console.log(`🎮 [ONLINE Tournament ${tournament.id}] Match started: ${match.id}`);
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

	private findMatch(tournament: TournamentState, matchId: string) {
		for (const round of tournament.rounds) {
			const match = round.find(x => x.id === matchId);
			if (match) return match;
		}
		return undefined;
	}

	/** push updates to UIs (tournament lobby + participants) */
	private broadcastTournamentUpdate(tournamentId: string) {
		const tournament = this.onlineTournaments.get(tournamentId);
		if (!tournament) return;
		const update = JSON.stringify({
			type: 'tournamentUpdate',
			state: this.getTournamentState(tournament.id)
		});

		for (const participant of tournament.participants) {
			const user = userManager.getUser(Number(participant.id));
			if (user?.tournamentSocket?.readyState === WebSocket.OPEN) {
				user.tournamentSocket.send(update);
			}
		}
	}

	getTournamentState(id: string) {
		const tournament = this.onlineTournaments.get(id);
		if (!tournament) return null;
		return {
			id: tournament.id,
			size: tournament.size,
			status: tournament.status,
			hostId: tournament.hostId,
			participants: tournament.participants.map(player => ({
				id: player.id,
				name: player.name
			})),
			rounds: tournament.rounds.map(round => round.map(match => ({
				id: match.id,
				status: match.status,
				p1: match.p1.id,
				p2: match.p2.id,
				winnerId: match.winnerId
			})))
		};
	}

	getOnlineTournaments() {
		return Array.from(this.onlineTournaments.values())
			.map(tournament => ({
				id: tournament.id,
				size: tournament.size,
				joined: tournament.participants.length,
				hostId: tournament.hostId,
				status: tournament.status,
				playerIds: tournament.participants.map(player => player.id)
			}));
	}

	getTournamentParticipant(userId: string): TournamentState | null {
		for (const tournament of this.onlineTournaments.values()) {
			if (tournament.participants.some(player => player.id === userId))
				return tournament;
		}
		return null;
	}

	getGameForPlayer(playerId: string): any {
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
		const tournament = this.onlineTournaments.get(tournamentId);
		if (tournament && tournament.rounds.length > 0 && tournament.rounds[0]!.some(match => match.id === matchId)) {
			if (!this.playerReadyStates.has(roundReadyKey)) {
				this.playerReadyStates.set(roundReadyKey, new Set());
			}
			this.playerReadyStates.get(roundReadyKey)!.add(playerId);
		}

		console.log(`🎯 [ONLINE Tournament ${tournamentId}] Player ${playerId} ready for match ${matchId}`);
	}

	quitOnlineTournament(userId: string) {
		const tournament = this.getTournamentParticipant(userId);
		if (!tournament) return;

		// Remove the user from the tournament participants
		tournament.participants = tournament.participants.filter(participant => participant.id !== userId);

		console.log(`❌ [ONLINE Tournament: ${tournament.id}] Player quit: ${userId}`);

		// Check if the tournament is empty
		if (tournament.participants.length === 0) {
			// Delete the tournament
			this.onlineTournaments.delete(tournament.id);
			console.log(`🗑 [ONLINE Tournament: ${tournament.id}] Empty tournament deleted`);

			// Notify all clients about the tournament deletion
			const update = JSON.stringify({
				type: 'tournamentDeleted',
				id: tournament.id
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

		// Send updated tournament list to all clients
		sendTournamentUpdate();

		// If the tournament is not empty, broadcast the update
		this.broadcastTournamentUpdate(tournament.id);
	}
}

export const onlineTournamentManager = new OnlineTournamentManager();
