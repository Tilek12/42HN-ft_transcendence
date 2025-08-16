import { GameRoom } from '../game/game-room';
import { Player } from '../game/types';

class GameManager {
	private rooms = new Map<string, GameRoom>();
	private waitingDuel = new Map<string, Player>();
	private nextId: number = 1;

	createGame(p1: Player, p2?: Player, tournamentId?: string): GameRoom {
		let roomId = `g-${this.nextId++}`;
		const room = new GameRoom(roomId, p1, p2 ?? null, tournamentId);
		this.rooms.set(room.id, room);

		// Auto-remove room when the game ends
		room.onEndCallback((winner, loser, winnerScore, loserScore) => {
			console.log(`🏁 [GameManager] Game ended in room ${room.id}`);
			console.log(`🥇 [GameManager] Winner: ${winner.name} (${winnerScore})`);
			console.log(`💔 [GameManager] Loser: ${loser.name} (${loserScore})`);
			this.rooms.delete(room.id);
			console.log(`🗑️ [GameManager] Removed room ${room.id}`);
		});

		return room;
	}

	getRoom(roomId: string): GameRoom | undefined {
		return this.rooms.get(roomId);
	}

	getRoomByPlayerId(playerId: string): GameRoom | undefined {
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

	getWaitingDuel() {
		return this.waitingDuel;
	}

	setWaitingDuelPlayer(id: string, player: Player) {
		this.waitingDuel.set(id, player);
	}

	removeWaitingDuelPlayer(id: string) {
		this.waitingDuel.delete(id);
	}
}

export const gameManager = new GameManager();
