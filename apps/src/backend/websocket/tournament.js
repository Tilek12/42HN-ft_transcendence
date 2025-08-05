"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const fastify_1 = require("fastify");
const ws_1 = require("ws");
const types_1 = require("../game/engine/types");
const user_manager_1 = require("../user/user-manager");
const constants_1 = require("../constants");
const tournament_manager_1 = require("../game/tournament/tournament-manager");
const tournamentPlugin = async (fastify) => {
    fastify.get('/tournament', { websocket: true }, async (connection, req) => {
        const params = new URLSearchParams(req.url?.split('?')[1] || '');
        const token = params.get('token');
        const action = params.get('action'); // "create" or "join"
        const tournamentId = params.get('id');
        const size = parseInt(params.get('size') || '4');
        const socket = connection.socket;
        if (!token || !action || (action === 'join' && !tournamentId)) {
            return socket.close(4001, 'Missing or invalid parameters');
        }
        let userId;
        try {
            const payload = await fastify.jwt.verify(token);
            userId = payload.id;
        }
        catch {
            return socket.close(4002, 'Invalid token');
        }
        const user = user_manager_1.userManager.getUser(userId);
        if (!user)
            return socket.close(4003, 'Presence connection not found');
        user_manager_1.userManager.setTournamentSocket(userId, socket);
        const player = { id: userId, socket };
        let tournament = null;
        if (action === 'create') {
            tournament = (0, tournament_manager_1.createTournament)(player, size);
        }
        else if (action === 'join') {
            tournament = (0, tournament_manager_1.joinTournament)(player, tournamentId);
        }
        if (!tournament) {
            socket.send(JSON.stringify({ type: 'error', message: 'Could not join or create tournament' }));
            socket.close();
            return;
        }
        user_manager_1.userManager.setInTornament(userId, true);
        console.log(`🎯 [Tournament WS] Connected: ${userId} (${action})`);
        socket.send(JSON.stringify({ type: 'tournamentJoined', id: tournament.id }));
        socket.on('message', (msg) => {
            const text = msg.toString();
            if (text === 'pong') {
                user_manager_1.userManager.setInTornament(userId, true);
                return;
            }
            try {
                const data = JSON.parse(text);
                if (data.type === 'quitTournament') {
                    (0, tournament_manager_1.quitTournament)(userId);
                    user_manager_1.userManager.removeTournamentSocket(userId);
                    socket.send(JSON.stringify({ type: 'tournamentLeft' }));
                }
            }
            catch (err) {
                console.warn('📛 [Tournament WS] Invalid message:', text);
            }
        });
        socket.on('close', () => {
            console.log(`❌ [Tournament WS] Disconnected: ${userId}`);
            (0, tournament_manager_1.quitTournament)(userId);
            user_manager_1.userManager.removeTournamentSocket(userId);
        });
        socket.on('error', (err) => {
            console.error(`⚠️ [Tournament WS] Error from ${userId}:`, err);
            socket.close();
        });
    });
    setInterval(() => {
        user_manager_1.userManager.getOnlineUsers().forEach(({ id }) => {
            const user = user_manager_1.userManager.getUser(id);
            if (!user || !user.tournamentSocket)
                return;
            if (!user.isInTournament) {
                console.log(`💀 [Tournament WS] Inactive, closing: ${id}`);
                user.tournamentSocket.close();
                user_manager_1.userManager.removeTournamentSocket(id);
                return;
            }
            user.isInTournament = false;
            if (user.tournamentSocket.readyState === ws_1.WebSocket.OPEN) {
                user.tournamentSocket.send('ping');
            }
        });
    }, constants_1.PING_INTERVAL_MS);
};
exports.default = (0, fastify_plugin_1.default)(tournamentPlugin);
//# sourceMappingURL=tournament.js.map