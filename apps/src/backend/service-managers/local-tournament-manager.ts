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

class LocalTournamentManager {

	private nextTid = 1;  // next tournament ID
	private nextMid = 1;  // next match ID
	private localTournaments = new Map<string, TournamentState>();  // all active local tournaments
	private localControlSockets = new Map<string, WebSocket>();

	/** Create a new local tournament */
	async createLocalTournament(
		host: Participant,
		size: TournamentSize,
		hostSocket: WebSocket,
		participantNames: string[] = [],
	) {
		const id = `t-local-${host.id}-${this.nextTid++}`;
		let participants: Participant[] = [];
		let tournament: TournamentState;
		let nextUid = 1;

		for (const name of participantNames) {
			participants.push({
				id: `local-${nextUid++}`,
				name
			});
		}

		this.localTournaments.set(id, tournament = {
			id,
			size,
			hostId: host.id,
			status: 'waiting',
			participants: participants,
			rounds: []
		});

		this.localControlSockets.set(id, hostSocket);

		console.log(`🏆 [LOCAL Tournament: ${tournament.id}] Created with participants: `, participants);

		return tournament;
	}

	/** Create the bracket and schedule round 1 */
	public async startLocalTournament(id: string) {
		const tournament = this.localTournaments.get(id);

		if (!tournament) return;

		tournament.status = 'active';

		// Seed + pair (in join/creation order)
		const seeded = [...tournament.participants];
		const round0: Match[] = [];

		for (let i = 0; i < seeded.length; i += 2) {
			round0.push(this.makeMatch(tournament, 0, seeded[i]!, seeded[i + 1]!));
		}

		tournament.rounds.push(round0);
		await this.startRoundSequentially(tournament, 0);

		console.log(`🏆 [LOCAL Tournament: ${tournament.id}] Started`);

		sendTournamentUpdate();

		this.broadcastTournamentUpdate(tournament.id);
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

	/** Local tournaments: start matches one-by-one on the same computer */
	private async startRoundSequentially(tournament: TournamentState, roundIdx: number) {
		const ctrlSocket: WebSocket | undefined = this.localControlSockets.get(tournament.id);
		if (!ctrlSocket) {
			console.error(`[LOCAL Tournament ${tournament.id}] No control socket found`);
			return;
		}
		for (const match of tournament.rounds[roundIdx]!) {
			this.startOneMatch(tournament, match, ctrlSocket); // await: resolves when game ends
		}
	}

	/** Start one match, wire onEnd → TournamentManager.onMatchEnded */
	private startOneMatch(tournament: TournamentState, match: Match, localSocket: WebSocket) {
		match.status = 'waiting_for_sockets';

		localSocket.send(JSON.stringify({
			type: 'matchStart',
			tournamentId: tournament.id,
			tournamentSize: tournament.size,
			matchId: match.id,
			player1: { id: match.p1.id, name: match.p1.name },
			player2: { id: match.p2.id, name: match.p2.name }
		}));
		// For local tournaments, start immediately since socket is ready
		this.startActualMatch(tournament.id, match, localSocket);
	}

	/** Actually start the game after socket readiness is confirmed */
	private startActualMatch(tournamentId: string, match: Match, localSocket?: WebSocket) {
		const tournament = this.localTournaments.get(tournamentId);
		if (!tournament) return;

		match.status = 'running';

		const toPlayer = (player: Participant) => {
			// Local: both players share the same localSocket
			if (localSocket) {
				return { id: player.id, name: player.name, socket: localSocket } as Player;
			}
			const user = userManager.getUser(Number(player.id));
			if (!user) {
				// Fall back to ghost socket to avoid crash; will be updated when game socket connects
				return GhostPlayer;
			}
		};

		const player1 = toPlayer(match.p1);
		const player2 = toPlayer(match.p2);

		const game = gameManager.createGame(
			'local-match',
			player1!,
			player2!,
			tournament.id,
			match.id
		);


		match.gameId = game.id;

		// Return a promise for local sequential flow
		return new Promise<void>((resolve) => {
			game.onEndCallback((winner, loser, ws, ls) => {
				this.onMatchEnd(tournament.id, match.id, { id: winner.id, name: winner.name }, { id: loser.id, name: loser.name }, ws, ls);
				console.log(`🎮 [LOCAL Tournament ${tournament.id}] Match started: ${match.id}`);
				resolve();
			});
		});
	}

	/** push updates to UIs (tournament lobby + participants) */
	private broadcastTournamentUpdate(tournamentId: string) {
		const tournament = this.localTournaments.get(tournamentId);
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
		const tournament = this.localTournaments.get(id);
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

	quitLocalTournament(userId: string) {
		const tournament = this.getTournamentParticipant(userId);
		if (!tournament) return;

		// Remove the user from the tournament participants
		tournament.participants = tournament.participants.filter(participant => participant.id !== userId);
		this.localControlSockets.delete(tournament.id);
		this.localTournaments.delete(tournament.id);

		console.log(`❌ [LOCAL Tournament: ${tournament.id}] Stopped`);
	}

	getTournamentParticipant(userId: string): TournamentState | null {
		for (const tournament of this.localTournaments.values()) {
			if (tournament.participants.some(player => player.id === userId))
				return tournament;
		}
		return null;
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
		const tournament = this.localTournaments.get(tournamentId);
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
		if (round && round.every(m => m.status === 'finished')) {
			const winners = round
				.map(m => tournament.participants.find(p => p.id === m.winnerId)!)
				.filter(Boolean);

			if (winners.length === 1) {
				// tournament finished
				console.log(`🏆 [LOCAL Tournament: ${tournament.id}] Winner: ${winners[0]!.id}`);

				// Send tournamentEnd message
				const winner = winners[0];
				const ctrlSocket = this.localControlSockets.get(tournament.id);
				if (ctrlSocket) {
					ctrlSocket.send(JSON.stringify({
						type: 'tournamentEnd',
						winner: { id: winner!.id, name: winner!.name }
					}));
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

			// this.startRoundSimultaneously(tournament, nextIdx);   <------- !!! FIX THIS !!! <--------
		}

		this.broadcastTournamentUpdate(tournament.id);
	}

	private findMatch(tournament: TournamentState, matchId: string) {
		for (const round of tournament.rounds) {
			const match = round.find(x => x.id === matchId);
			if (match) return match;
		}
		return undefined;
	}

	getUserTournament(userId: string): TournamentState | null {
		for (const tournament of this.localTournaments.values()) {
			if (tournament.participants.some(p => p.id === userId)) {
				return tournament;
			}
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
}

export const localTournamentManager = new LocalTournamentManager();
