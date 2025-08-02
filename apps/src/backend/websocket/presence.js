"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastTournaments = exports.getPresenceUsers = void 0;
const fastify_1 = require("fastify");
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const ws_1 = require("ws");
const tournament_manager_1 = require("../game/tournament/tournament-manager");
const presenceUsers = [];
const HEARTBEAT_INTERVAL = 10000;
function broadcastPresence(msg) {
    const data = JSON.stringify(msg);
    presenceUsers.forEach((user) => {
        if (user.socket.readyState === ws_1.WebSocket.OPEN) {
            user.socket.send(data);
        }
    });
}
const getPresenceUsers = () => presenceUsers;
exports.getPresenceUsers = getPresenceUsers;
const broadcastTournaments = () => {
    const tournaments = (0, tournament_manager_1.getSafeTournamentData)();
    broadcastPresence({ type: 'tournamentUpdate', tournaments });
};
exports.broadcastTournaments = broadcastTournaments;
const presencePlugin = async (fastify) => {
    fastify.get('/presence', { websocket: true }, async (connection, req) => {
        const params = new URLSearchParams(req.url?.split('?')[1] || '');
        const token = params.get('token');
        if (!token) {
            connection.socket.close(4001, 'Missing token');
            return;
        }
        let userId;
        try {
            const payload = await fastify.jwt.verify(token);
            userId = payload.id;
        }
        catch {
            connection.socket.close(4002, 'Invalid token');
            return;
        }
        const socket = connection.socket;
        const user = { id: userId, socket, isAlive: true };
        const existing = presenceUsers.find(u => u.id === userId);
        if (existing) {
            console.warn(`🔁 [Presence WS] Replacing existing connection for: ${userId}`);
            existing.socket.close();
            presenceUsers.splice(presenceUsers.indexOf(existing), 1);
        }
        presenceUsers.push(user);
        console.log(`🟢 [Presence WS] Connected: ${userId}`);
        socket.send(JSON.stringify({
            type: 'tournamentUpdate',
            tournaments: (0, tournament_manager_1.getSafeTournamentData)()
        }));
        socket.send(JSON.stringify({
            type: 'presenceUpdate',
            count: presenceUsers.length,
            users: presenceUsers.map(u => ({ id: u.id }))
        }));
        socket.on('message', (msg) => {
            if (msg.toString() === 'pong')
                user.isAlive = true;
        });
        socket.on('close', () => {
            const index = presenceUsers.findIndex(u => u.id === userId);
            if (index !== -1)
                presenceUsers.splice(index, 1);
            console.log(`🔴 [Presence WS] Disconnected: ${userId}`);
        });
    });
    setInterval(() => {
        presenceUsers.forEach((user, index) => {
            if (user.socket.readyState !== ws_1.WebSocket.OPEN)
                return;
            if (!user.isAlive) {
                user.socket.close();
                presenceUsers.splice(index, 1);
                return;
            }
            user.isAlive = false;
            user.socket.send('ping');
        });
    }, HEARTBEAT_INTERVAL);
};
exports.default = (0, fastify_plugin_1.default)(presencePlugin);
//# sourceMappingURL=presence.js.map