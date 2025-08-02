"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = require("fastify");
const ws_1 = require("ws");
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const matchmaking_1 = require("../game/engine/matchmaking");
const types_1 = require("../game/engine/types");
const connectedUsers = [];
const PING_INTERVAL_MS = 10000;
const wsGamePlugin = async (fastify) => {
    fastify.get('/game', { websocket: true }, async (connection, req) => {
        const url = req.url || '';
        const params = new URLSearchParams(url?.split('?')[1] || '');
        const mode = params.get('mode') ?? 'solo';
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
            connection.socket.close(4002, 'Invalid or expired token');
            return;
        }
        const socket = connection.socket;
        const player = { id: userId, socket };
        connectedUsers.push({ id: userId, socket, isAlive: true });
        console.log(`🏓 [Game WS] Connected: ${userId} (${mode})`);
        // Only handle solo or duel games
        if (mode === 'duel' || mode === 'solo') {
            (0, matchmaking_1.startGame)(player, mode);
        }
        else {
            console.warn(`⛔️ [Game WS] Invalid mode: ${mode}`);
            socket.close(4003, 'Unsupported mode');
            return;
        }
        socket.on('message', (msg) => {
            if (msg.toString() === 'pong') {
                const user = connectedUsers.find(u => u.id === userId);
                if (user)
                    user.isAlive = true;
            }
            else if (msg.toString() === 'quit') {
                (0, matchmaking_1.cancelDuelSearch)(userId);
                socket.close();
            }
        });
        socket.on('close', () => {
            console.log(`❌ [Game WS] Player disconnected: ${userId}`);
            (0, matchmaking_1.cancelDuelSearch)(userId);
            const index = connectedUsers.findIndex(u => u.id === userId);
            if (index !== -1)
                connectedUsers.splice(index, 1);
        });
    });
    // Heartbeat
    setInterval(() => {
        connectedUsers.forEach((user, i) => {
            if (user.socket.readyState !== ws_1.WebSocket.OPEN)
                return;
            if (!user.isAlive) {
                console.log(`💀 [Game WS] Terminating inactive: ${user.id}`);
                user.socket.close();
                connectedUsers.splice(i, 1);
                (0, matchmaking_1.cancelDuelSearch)(user.id);
                return;
            }
            user.isAlive = false;
            user.socket.send('ping');
        });
    }, PING_INTERVAL_MS);
};
exports.default = (0, fastify_plugin_1.default)(wsGamePlugin);
//# sourceMappingURL=game.js.map