import { WebSocket } from 'ws';

interface User {
	id: string;
	name: string;
	gameSocket: WebSocket | null;
	presenceSocket: WebSocket | null;
	tournamentSocket: WebSocket | null;
	tournamentId?: number;
	tournamentMatchId?: number;
	isAlive: boolean;
}

class UserManager {
	private users = new Map<string, User>();

	getUser(id: string): User | undefined {
		return this.users.get(id);
	}

	createUser(id: string, name: string, presenceSocket: WebSocket): boolean {
		if (this.users.has(id)) return false;

		const user: User = {
			id,
			name,
			gameSocket: null,
			presenceSocket,
			tournamentSocket: null,
			isAlive: true,
		};

		this.users.set(id, user);
		return true;
	}

	removeUser(id: string) {
		const user = this.getUser(id);
		if (!user) return;

		user.gameSocket?.close();
		user.presenceSocket?.close();
		user.tournamentSocket?.close();

		this.users.delete(id);
	}

	setAlive(id: string, alive: boolean) {
		const user = this.getUser(id);
		if (user) user.isAlive = alive;
	}

	getOnlineUsers() {
		return Array.from(this.users.values()).map(({ id, name }) => ({ id, name }));
	}

	getOnlineUsersCount() {
		return this.users.size;
	}

	setGameSocket(id: string, socket: WebSocket) {
		const user = this.getUser(id);
		if (!user) return;

		user.gameSocket?.close();
		user.gameSocket = socket;
	}

	removeGameSocket(id: string) {
		const user = this.getUser(id);
		if (user?.gameSocket) {
			user.gameSocket.close();
			user.gameSocket = null;
		}
	}

	setPresenceSocket(id: string, socket: WebSocket) {
		const user = this.getUser(id);
		if (!user) return;

		user.presenceSocket?.close();
		user.presenceSocket = socket;
	}

	removePresenceSocket(id: string) {
		const user = this.getUser(id);
		if (user?.presenceSocket) {
			user.presenceSocket.close();
			user.presenceSocket = null;
		}
	}

	setTournamentSocket(id: string, socket: WebSocket) {
		const user = this.getUser(id);
		if (!user) return;

		user.tournamentSocket?.close();
		user.tournamentSocket = socket;
	}

	removeTournamentSocket(id: string) {
		const user = this.getUser(id);
		if (user?.tournamentSocket) {
			user.tournamentSocket.close();
			user.tournamentSocket = null;
		}
	}

	checkHeartbeats() {
		for (const [id, user] of this.users.entries()) {
			if (!user.isAlive) {
				console.log(`💀 Removing inactive user: ${id}`);
				this.removeUser(id);
			} else {
				user.isAlive = false;
				user.presenceSocket?.send('ping');
			}
		}
	}
}

export const userManager = new UserManager();
