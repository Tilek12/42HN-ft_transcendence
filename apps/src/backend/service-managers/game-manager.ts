import { GameRoom } from '../game/game-room';
import { Player, GhostPlayer, GameMode } from '../game/game-types';
import { onlineTournamentManager } from './online-tournament-manager';
import { localTournamentManager } from './local-tournament-manager';
import { userManager } from './user-manager';
import { incrementWinsOrLossesOrTrophies } from '../database/profile';
import { createMatch } from '../database/match';

class GameManager {
	private rooms = new Map<number, GameRoom>();
	private waitingDuel = new Map<number, Player>();
	private nextId = 1;

	// ===== ROOM MANAGEMENT METHODS =====
	createGame(mode: GameMode, p1: Player, p2: Player, tournamentId?: number, matchId?: number): GameRoom {
		console.log('createGame mode:', mode, 'for players:', p1.id, p2.id);

		let isTournament: boolean = tournamentId && matchId ? true : false;
		let roomId: number;
		// if (isTournament)
		// 	roomId = this.nextId++;
		// else
			roomId = this.nextId++;
		const room = new GameRoom(roomId, mode, p1, p2, tournamentId);
		this.rooms.set(roomId, room);
		// // Auto-remove room when the game ends
		room.onEndCallback((winner, loser, winnerScore, loserScore) => {
			console.log(`🏁 [GameManager] Game ended in room ${room.id}: ${winner.name} (${winnerScore} - ${loserScore}) ${loser.name}`);

			// Clean up sockets
			userManager.removeGameSocket(Number(winner.id));
			userManager.removeGameSocket(Number(loser.id));

			if (isTournament && tournamentId && matchId) {
				const tournamentManager = mode === 'online-match'
					? onlineTournamentManager
					: localTournamentManager;
				tournamentManager.onMatchEnd(
					tournamentId,
					matchId,
					{ id: winner.id, name: winner.name },
					{ id: loser.id, name: loser.name },
					winnerScore,
					loserScore
				);
			}

			this.rooms.delete(room.id);
			console.log(`🗑️ [GameManager] Removed room ${room.id}`);
		});

		return room;
	}

	getRoom(roomId: number): GameRoom | undefined {
		return this.rooms.get(roomId);
	}

	getRoomByPlayerId(playerId: number): GameRoom | undefined {
		return this.getAllRooms().find(room =>
			room.getPlayers().some(player => player.id === playerId)
		);
	}

	cleanUpInactiveGames() {
		for (const [id, room] of this.rooms.entries()) {
			if (room.isEnded()) {
				this.rooms.delete(id);
				console.log(`🗑️ [GameManager] Cleaned up inactive room ${id}`);
			}
		}
	}

	getAllRooms(): GameRoom[] {
		return Array.from(this.rooms.values());
	}

	// ===== MATCHMAKING METHODS =====
	async startGame(player: Player, mode: GameMode, tournamentId?: number): Promise<void> {
		console.log('startGame called with mode:', mode, 'for player:', player.id);

		if (mode === 'solo') {
			this.createGame(mode, player, GhostPlayer);
			return;
		}

		if (mode === 'online-match' || mode === 'local-match') {
			// The game room should already exist, just update the player's socket
			const tournamentManager = mode === 'online-match'
				? onlineTournamentManager
				: localTournamentManager;
			const game = tournamentManager.getGameForPlayer(player.id);
			if (game) {
				console.log('Updating socket for existing match game for player:', player.id);
				game.updateSocket(player);
			}
			else
				console.warn(`No existing game found for player ${player.id} in mode ${mode}`);
			return;
		}

		// if (mode === 'local-match') {
		// 	// The game room should already exist, just update the player's socket
		// 	const game = localTournamentManager.getGameForPlayer(player.id);
		// 	if (game) {
		// 		console.log('Updating socket for existing match game for player:', player.id);
		// 		game.updateSocket(player);
		// 	}
		// 	else
		// 		console.warn(`No existing game found for player ${player.id} in mode ${mode}`);
		// 	return;
		// }

		if (mode !== 'duel') {
			console.warn(`🚫 Invalid game mode: ${mode}`);
			return;
		}

		if (this.getWaitingDuel().has(player.id)) {
			console.warn(`🚫 Player ${player.id} already waiting for a duel`);
			return;
		}

		this.setWaitingDuelPlayer(player.id, player);
		const players = Array.from(this.getWaitingDuel().values());

		if (players.length >= 2) {
			const [p1, p2] = players;
			this.removeWaitingDuelPlayer(p1!.id);
			this.removeWaitingDuelPlayer(p2!.id);

			const game = this.createGame( 'duel',p1! ,p2!, tournamentId);
			game.onEndCallback( async(winner, loser, winnerScore, loserScore) => {
				const room = game;
				console.log(`🏁 [GameManager] Game ended in room ${room.id}: ${winner.name} (${winnerScore} - ${loserScore}) ${loser.name}`);

				// Clean up sockets
				userManager.removeGameSocket(Number(winner.id));
				userManager.removeGameSocket(Number(loser.id));

				// if (isTournament && tournamentId && matchId) {
				// 	const tournamentManager = mode === 'online-match'
				// 		? onlineTournamentManager
				// 		: localTournamentManager;
				// 	tournamentManager.onMatchEnd(
				// 		tournamentId,
				// 		matchId,
				// 		{ id: winner.id, name: winner.name },
				// 		{ id: loser.id, name: loser.name },
				// 		winnerScore,
				// 		loserScore
				// 	);
				// }

				// this.rooms.delete(room.id);
				console.log(`🗑️ [GameManager] Removed room ${room.id}`);
				//------Thomas code-------
				if (winner)
					await incrementWinsOrLossesOrTrophies(winner.id, "wins");
				if (loser)
					await incrementWinsOrLossesOrTrophies(loser.id, "losses");

				//------ Save to matches table -------
				// const isTournamentMatch = mode === 'duel' && !!tournamentId;
				// if (isTournamentMatch) {
					await createMatch(
						winner.id,
						loser.id,
						winnerScore,
						loserScore,
						false
					);
				// }

				// Get last inserted match ID
				//    const { id: lastMatchId } = await db.get(`SELECT last_insert_rowid() as id`);
				// Link match to tournament
				// if (isTournamentMatch && tournamentId) {
				//   await linkMatchToTournament(parseInt(tournamentId.split('-')[1]), lastMatchId);
				// }
			});
		}
	}

	cancelDuelSearch(userId: number) {
		if (this.getWaitingDuel().has(userId)) {
			this.removeWaitingDuelPlayer(userId);
			console.log(`🛑 [GameManager] Removed ${userId} from duel queue`);
		}
	}

	// ===== QUEUE MANAGEMENT METHODS =====
	getWaitingDuel() {
		return this.waitingDuel;
	}

	setWaitingDuelPlayer(id: number, player: Player) {
		this.waitingDuel.set(id, player);
	}

	removeWaitingDuelPlayer(id: number ) {
		this.waitingDuel.delete(id);
	}
}

export const gameManager = new GameManager();
