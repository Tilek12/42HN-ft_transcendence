import WebSocket from 'ws'
import { User } from '../backendTypes'

class UserManager {
	private users = new Map<number, User>();

	getUser(id: number): User | undefined {
		return this.users.get(id);
	}

	createUser(newuser: User, presenceSocket: WebSocket): boolean {
		if (this.users.has(newuser.id)) return false;

		const user: User = newuser;

		user.name = newuser.username,
			user.gameSocket = null,
			user.presenceSocket = presenceSocket,
			user.localTournamentSocket = null,
			user.onlineTournamentSocket = null,
			user.isAlive = true,
			user.isInGame = false,
			user.isInLocalTournament = false,
			user.isInOnlineTournament = false,

			this.users.set(user.id, user);
		return true;
	}

	removeUser(id: number) {
		const user = this.getUser(id);
		if (user) {
			// Only forcibly close sockets if this is a *true* logout or lost connection
			if (user.presenceSocket?.readyState === WebSocket.OPEN)
			{
				console.log(" usermanager removeUser closing presence socket for user", id);
				user.presenceSocket.close(4009,'usermanager removeUser closing presence socket for user' );
			}
			console.log(" usermanager removeUser closing game/local/online tournament sockets for user", id);
			user.gameSocket?.close(4010, 'usermanager removeUser closing game/local/online tournament sockets for user');
			user.localTournamentSocket?.close(4011, 'usermanager removeUser closing game/local/online tournament sockets for user');
			user.onlineTournamentSocket?.close(4012, 'usermanager removeUser closing game/local/online tournament sockets for user');

			this.users.delete(id);
		}
		else {
			console.log("no user to removee")
			return;
		}
	}

	removeAllUsers()
	{
		 this.users.forEach((u:User)=>{this.removeUser(u.id)});
		 console.log("❎ All Users logged out.");
	}

	setAlive(id: number) {
		const user = this.getUser(id);
		if (user) {
			user.isAlive = true;
		}
	}

	setInGame(id: number, value: boolean) {
		console.log('setInGame for:', id, value);
		const user = this.getUser(id);
		if (user) user.isInGame = value;
	}

	setInLocalTournament(user: User, value: boolean) {
		if (user)
			user.isInLocalTournament = value;
	}

	setInOnlineTournament(user: User, value: boolean) {
		if (user)
			user.isInOnlineTournament = value;
	}

	getOnlineUsers() {
		return Array.from(this.users.values()).map(({ id, name }) => ({ id, name }));
	}

	getOnlineUsersCount() {
		return this.users.size;
	}

	setGameSocket(id: number, socket: WebSocket) {
		console.log("setGameSocket for: ", id);
		const user = this.getUser(id);
		if (!user) return;

		if (user.gameSocket && user.gameSocket.readyState === WebSocket.OPEN) {
			console.log(`User ${id} already has an active game socket`);
			socket.close(4005, 'Game already active');
			return;
		}
		if (user.gameSocket) {
			console.log(`Closing previous game socket for user ${id}`);
			user.gameSocket.close(4013, `Closing previous game socket for user ${id}`);
		}
		user.gameSocket = socket;
	}

	removeGameSocket(id: number) {
		const user = this.getUser(id);
		if (user?.gameSocket) {
			console.log(`Removing game socket for user ${id}`);
			user.gameSocket.close(4002, `Removing game socket for user ${id}`);
			user.gameSocket = null;
		}
	}

	setPresenceSocket(id: number, socket: WebSocket) {
		const user = this.getUser(id);
		if (!user) return;

		user.presenceSocket?.close(4014, 'setPresence');
		user.presenceSocket = socket;
	}

	removePresenceSocket(id: number) {
		const user = this.getUser(id);
		if (user?.presenceSocket) {
			user.presenceSocket.close(4015, 'removePresence');
			user.presenceSocket = null;
		}
	}

	setLocalTournamentSocket(user: User | undefined, socket: WebSocket) {

		if (!user) return;

		user.localTournamentSocket?.close(4016, 'setLocalTournament');
		user.localTournamentSocket = socket;
	}

	removeLocalTournamentSocket(user: User | undefined) {
		if (user && user.localTournamentSocket) {
			user.localTournamentSocket.close(4017, 'removeLocalTournament');
			user.localTournamentSocket = null;
		}
	}

	setOnlineTournamentSocket(user: User | undefined, socket: WebSocket) {

		if (!user) return;

		user.onlineTournamentSocket?.close(4018,'setOnlineTournamentSocket');
		user.onlineTournamentSocket = socket;
	}

	removeOnlineTournamentSocket(user: User | undefined) {
		if (user && user.onlineTournamentSocket) {
			user.onlineTournamentSocket.close(4019, "removeOnlineTournamentSocket");
			user.onlineTournamentSocket = null;
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
