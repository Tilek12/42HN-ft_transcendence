import { WebSocket } from 'ws';

interface User {
	id: number;
	name: string;
	gameSocket: WebSocket | null;
	presenceSocket: WebSocket | null;
	tournamentSocket: WebSocket | null;
	tournamentId?: number;
	tournamentMatchId?: number;
	isAlive: boolean;
	isInGame: boolean;
	isInTournament: boolean;
}

class UserManager {
	private users = new Map<number, User>();

	getUser(id: number): User | undefined {
		return this.users.get(id);
	}

	createUser(id: number, name: string, presenceSocket: WebSocket): boolean {
		if (this.users.has(id)) return false;

		const user: User = {
			id,
			name,
			gameSocket: null,
			presenceSocket,
			tournamentSocket: null,
			isAlive: true,
			isInGame: false,
			isInTournament: false,
		};

		this.users.set(id, user);
		return true;
	}

	removeUser(id: number) {
		const user = this.getUser(id);
		if (!user) return;

		// Only forcibly close sockets if this is a *true* logout or lost connection
		if (user.presenceSocket?.readyState === WebSocket.OPEN)
			user.presenceSocket.close();

		user.gameSocket?.close();
		user.tournamentSocket?.close();

		this.users.delete(id);
	}

	setAlive(id: number, alive: boolean) {
		const user = this.getUser(id);
		if (user) user.isAlive = alive;
	}

	setInGame(id: number, value: boolean) {
		const user = this.getUser(id);
		if (user) user.isInGame = value;
	}

	setInTournament(id: string, value: boolean) {
		const user = this.getUser(id);
		if (user) user.isInTournament = value;
	}

	getOnlineUsers() {
		return Array.from(this.users.values()).map(({ id, name }) => ({ id, name }));
	}

	getOnlineUsersCount() {
		return this.users.size;
	}

	setGameSocket(id: number, socket: WebSocket) {
		const user = this.getUser(id);
		if (!user) return;

		if (user.gameSocket && user.gameSocket.readyState === WebSocket.OPEN) {
			console.warn(`User ${id} already has an active game socket`);
			socket.close(4005, 'Game already active');
			return;
		}

		user.gameSocket?.close();
		user.gameSocket = socket;
	}

	removeGameSocket(id: number) {
		const user = this.getUser(id);
		if (user?.gameSocket) {
			user.gameSocket.close();
			user.gameSocket = null;
		}
	}

	setPresenceSocket(id: number, socket: WebSocket) {
		const user = this.getUser(id);
		if (!user) return;

		user.presenceSocket?.close();
		user.presenceSocket = socket;
	}

	removePresenceSocket(id: number) {
		const user = this.getUser(id);
		if (user?.presenceSocket) {
			user.presenceSocket.close();
			user.presenceSocket = null;
		}
	}

	setTournamentSocket(id: number, socket: WebSocket) {
		const user = this.getUser(id);
		if (!user) return;

		user.tournamentSocket?.close();
		user.tournamentSocket = socket;
	}

	removeTournamentSocket(id: number) {
		const user = this.getUser(id);
		if (user?.tournamentSocket) {
			user.tournamentSocket.close();
			user.tournamentSocket = null;
		}
	}

	checkHeartbeats() {
		for (const [id, user] of this.users.entries()) {
			if (!user.isAlive) {
				console.log(`💀 [Presence WS] Removing inactive user: ${id}`);
				this.removeUser(id);
			} else {
				user.isAlive = false;
				user.presenceSocket?.send('ping');
			}
		}
	}
}

export const userManager = new UserManager();
