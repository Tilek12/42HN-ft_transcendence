"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userManager = void 0;
const ws_1 = require("ws");
const types_1 = require("../game/engine/types");
class UserManager {
    users = new Map();
    waitingDuel = new Map();
    getUser(id) {
        return this.users.get(id);
    }
    createUser(id, name, presenceSocket) {
        if (this.users.has(id))
            return false;
        const user = {
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
    removeUser(id) {
        const user = this.getUser(id);
        if (!user)
            return;
        // Only forcibly close sockets if this is a *true* logout or lost connection
        if (user.presenceSocket?.readyState === ws_1.WebSocket.OPEN)
            user.presenceSocket.close();
        user.gameSocket?.close();
        user.tournamentSocket?.close();
        this.users.delete(id);
    }
    setAlive(id, alive) {
        const user = this.getUser(id);
        if (user)
            user.isAlive = alive;
    }
    setInGame(id, value) {
        const user = this.getUser(id);
        if (user)
            user.isInGame = value;
    }
    setInTornament(id, value) {
        const user = this.getUser(id);
        if (user)
            user.isInTournament = value;
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
    setWaitingDuelPlayer(id, player) {
        this.waitingDuel.set(id, player);
    }
    removeWaitingDuelPlayer(id) {
        this.waitingDuel.delete(id);
    }
    setGameSocket(id, socket) {
        const user = this.getUser(id);
        if (!user)
            return;
        if (user.gameSocket && user.gameSocket.readyState === ws_1.WebSocket.OPEN) {
            console.warn(`User ${id} already has an active game socket`);
            socket.close(4005, 'Game already active');
            return;
        }
        user.gameSocket?.close();
        user.gameSocket = socket;
    }
    removeGameSocket(id) {
        const user = this.getUser(id);
        if (user?.gameSocket) {
            user.gameSocket.close();
            user.gameSocket = null;
        }
    }
    setPresenceSocket(id, socket) {
        const user = this.getUser(id);
        if (!user)
            return;
        user.presenceSocket?.close();
        user.presenceSocket = socket;
    }
    removePresenceSocket(id) {
        const user = this.getUser(id);
        if (user?.presenceSocket) {
            user.presenceSocket.close();
            user.presenceSocket = null;
        }
    }
    setTournamentSocket(id, socket) {
        const user = this.getUser(id);
        if (!user)
            return;
        user.tournamentSocket?.close();
        user.tournamentSocket = socket;
    }
    removeTournamentSocket(id) {
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
            }
            else {
                user.isAlive = false;
                user.presenceSocket?.send('ping');
            }
        }
    }
}
exports.userManager = new UserManager();
//# sourceMappingURL=user-manager.js.map