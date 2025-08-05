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
const user_manager_1 = require("../user/user-manager");
const constants_1 = require("../constants");
const wsGamePlugin = async (fastify) => {
    fastify.get('/game', { websocket: true }, async (connection, req) => {
        const params = new URLSearchParams(req.url?.split('?')[1] || '');
        const mode = params.get('mode') ?? 'solo';
        const token = params.get('token');
        const socket = connection.socket;
        if (!token)
            return socket.close(4001, 'Missing token');
        let userId;
        try {
            const payload = await fastify.jwt.verify(token);
            userId = payload.id;
        }
        catch {
            return socket.close(4002, 'Invalid or expired token');
        }
        const user = user_manager_1.userManager.getUser(userId);
        if (!user)
            return socket.close(4003, 'Presence connection not found');
        user_manager_1.userManager.setGameSocket(userId, socket);
        user_manager_1.userManager.setInGame(userId, true);
        console.log(`🏓 [Game WS] Connected: ${userId} (${mode})`);
        const player = { id: userId, name: user.name, socket };
        if (mode === 'duel' || mode === 'solo') {
            (0, matchmaking_1.startGame)(player, mode);
        }
        else {
            console.warn(`⛔️ [Game WS] Invalid mode: ${mode}`);
            return socket.close(4004, 'Unsupported mode');
        }
        socket.on('message', (msg) => {
            if (msg.toString() === 'pong') {
                user_manager_1.userManager.setInGame(userId, true);
            }
            else if (msg.toString() === 'quit') {
                (0, matchmaking_1.cancelDuelSearch)(userId);
                socket.close();
            }
        });
        socket.on('close', () => {
            console.log(`❌ [Game WS] Disconnected: ${userId}`);
            (0, matchmaking_1.cancelDuelSearch)(userId);
            user_manager_1.userManager.removeGameSocket(userId);
        });
    });
    setInterval(() => {
        for (const { id } of user_manager_1.userManager.getOnlineUsers()) {
            const user = user_manager_1.userManager.getUser(id);
            const socket = user?.gameSocket;
            if (!socket || socket.readyState !== ws_1.WebSocket.OPEN)
                continue;
            if (!user?.isInGame) {
                console.log(`💀 [Game WS] Terminating inactive game connection: ${id}`);
                socket.close();
                user_manager_1.userManager.removeGameSocket(id);
            }
            else {
                user.isInGame = false;
                socket.send('ping');
            }
        }
    }, constants_1.PING_INTERVAL_MS);
};
exports.default = (0, fastify_plugin_1.default)(wsGamePlugin);
//# sourceMappingURL=game.js.map