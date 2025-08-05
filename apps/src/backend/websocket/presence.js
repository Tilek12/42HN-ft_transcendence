"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = require("fastify");
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const ws_1 = require("ws");
const user_manager_1 = require("../user/user-manager");
const tournament_manager_1 = require("../game/tournament/tournament-manager");
const user_1 = require("../database/user");
const constants_1 = require("../constants");
const sendPresenceUpdate = () => {
    const users = user_manager_1.userManager.getOnlineUsers();
    const msg = JSON.stringify({
        type: 'presenceUpdate',
        count: users.length,
        users,
    });
    for (const u of users) {
        const socket = user_manager_1.userManager.getUser(u.id)?.presenceSocket;
        if (socket?.readyState === ws_1.WebSocket.OPEN)
            socket.send(msg);
    }
};
const sendTournamentUpdate = () => {
    const users = user_manager_1.userManager.getOnlineUsers();
    const msg = JSON.stringify({
        type: 'tournamentUpdate',
        tournaments: (0, tournament_manager_1.getSafeTournamentData)(),
    });
    for (const u of users) {
        const socket = user_manager_1.userManager.getUser(u.id)?.presenceSocket;
        if (socket?.readyState === ws_1.WebSocket.OPEN)
            socket.send(msg);
    }
};
const presencePlugin = async (fastify) => {
    fastify.get('/presence', { websocket: true }, async (connection, req) => {
        const token = new URLSearchParams(req.url?.split('?')[1] || '').get('token');
        const socket = connection.socket;
        if (!token)
            return socket.close(4001, 'Missing token');
        let userId;
        try {
            const payload = await fastify.jwt.verify(token);
            userId = payload.id;
        }
        catch {
            return socket.close(4002, 'Invalid token');
        }
        if (user_manager_1.userManager.getUser(userId)) {
            console.warn(`🔁 [Presence WS] Duplicate connection rejected for: ${userId}`);
            socket.close(4003, 'Already connected');
            return;
        }
        const user = await (0, user_1.findUserById)(userId);
        if (!user) {
            socket.close(4004, 'User not found');
            return;
        }
        const userName = await (0, user_1.getUsernameById)(userId);
        if (!userName) {
            socket.close(4004, 'Username not found');
            return;
        }
        user_manager_1.userManager.createUser(userId, userName, socket);
        console.log(`🟢 [Presence WS] Connected: ${userId}`);
        sendTournamentUpdate();
        sendPresenceUpdate();
        socket.on('message', (msg) => {
            if (msg.toString() === 'pong')
                user_manager_1.userManager.setAlive(userId, true);
        });
        socket.on('close', () => {
            user_manager_1.userManager.removeUser(userId);
            console.log(`🔴 [Presence WS] Disconnected: ${userId}`);
            sendPresenceUpdate();
        });
    });
    setInterval(() => {
        user_manager_1.userManager.checkHeartbeats();
    }, constants_1.PING_INTERVAL_MS);
};
exports.default = (0, fastify_plugin_1.default)(presencePlugin);
//# sourceMappingURL=presence.js.map