import { GameRoom } from './game-room';
import { Player } from './types';

class GameManager {
	private rooms = new Map<string, GameRoom>();

	createGame(p1: Player, p2?: Player, tournamentId?: string): GameRoom {
		const room = new GameRoom(p1, p2 ?? null, tournamentId);
		this.rooms.set(room.id, room);

		// Auto-remove room when the game ends
		room.onEnd(() => {
			this.rooms.delete(room.id);
			console.log(`🗑️ [GameManager] Removed room ${room.id}`);
		});

		return room;
	}

	getRoom(roomId: string): GameRoom | undefined {
		return this.rooms.get(roomId);
	}

	getAllRooms(): GameRoom[] {
		return Array.from(this.rooms.values());
	}
}

export const gameManager = new GameManager();
