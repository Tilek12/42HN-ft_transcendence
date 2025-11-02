import WebSocket from 'ws'
import { User } from '../types'

class UserManager {
	private users = new Map<number, User>();

	getUser(id: number): User | undefined {
		return this.users.get(id);
	}

	createUser(newuser:User, presenceSocket: WebSocket.WebSocket): boolean {
		if (this.users.has(newuser.id)) return false;

		const user: User = newuser;
		
			user.name = 			newuser.username,
			user.gameSocket =		null,
			user.presenceSocket =	presenceSocket,
			user.tournamentSocket =	null,
			user.isAlive =			true,
			user.isInGame =			false,
			user.isInTournament =	false,

		this.users.set(user.id, user);
		return true;
	}

	removeUser(id: number) {
		const user = this.getUser(id);
		if (user)
		{
			// Only forcibly close sockets if this is a *true* logout or lost connection
			if (user.presenceSocket?.readyState === WebSocket.OPEN)
				user.presenceSocket.close();

			user.gameSocket?.close();
			user.tournamentSocket?.close();

			this.users.delete(id);
		}
		else
		{
			console.log("no user to removee")
			return;
		}
}

	setAlive(id: number) {
		const user = this.getUser(id);
		if (user){
			user.isAlive = true;
		}
	}

	setInGame(id: number, value: boolean) {
		const user = this.getUser(id);
		if (user) user.isInGame = value;
	}

	setInTournament(id: number, value: boolean) {
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
			// console.log("User alive: ", user.username);
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
