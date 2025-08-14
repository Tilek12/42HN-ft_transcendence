import { WebSocket } from 'ws';
import { Player } from '../game/types';
import profile = require('../database/profile');

interface User {
	id: string;
	name: string;
	gameSocket: WebSocket | null;
	presenceSocket: WebSocket | null;
	tournamentSocket: WebSocket | null;
	tournamentId?: number;
	tournamentMatchId?: number;
	isAlive: boolean;
	isInGame: boolean;
	isInTournament: boolean;
	logged_in?: boolean;
	profileId?: string,
	wins?: number;
	losses?: number;
	trophies?: number;
}

class UserManager {
	private users = new Map<string, User>();
	private waitingDuel = new Map<string, Player>();

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
			isInGame: false,
			isInTournament: false,
		};

		this.users.set(id, user);
		return true;
	}

	removeUser(id: string) {
		const user = this.getUser(id);
		if (!user) return;

		// Only forcibly close sockets if this is a *true* logout or lost connection
		if (user.presenceSocket?.readyState === WebSocket.OPEN)
			user.presenceSocket.close();

		user.gameSocket?.close();
		user.tournamentSocket?.close();

		this.users.delete(id);
	}

	setAlive(id: string, alive: boolean) {
		const user = this.getUser(id);
		if (user) user.isAlive = alive;
	}

	setInGame(id: string, value: boolean) {
		const user = this.getUser(id);
		if (user) user.isInGame = value;
	}

	setInTornament(id: string, value: boolean) {
		const user = this.getUser(id);
		if (user) user.isInTournament = value;
	}

	getOnlineUsers() {
		return Array.from(this.users.values()).map(({ id, name }) => ({ id, name }));
	}

	getOnlineUsersCount() {
		return this.users.size;
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

	setGameSocket(id: string, socket: WebSocket) {
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
