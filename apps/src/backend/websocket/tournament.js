"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tournamentSockets = void 0;
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const fastify_1 = require("fastify");
const types_1 = require("../game/engine/types");
const tournament_manager_1 = require("../game/tournament/tournament-manager");
const tournamentSockets = new Map();
exports.tournamentSockets = tournamentSockets;
const tournamentPlugin = async (fastify) => {
    fastify.get('/tournament', { websocket: true }, async (connection, req) => {
        const params = new URLSearchParams(req.url?.split('?')[1] || '');
        const token = params.get('token');
        const action = params.get('action'); // "create" or "join"
        const tournamentId = params.get('id');
        const size = parseInt(params.get('size') || '4');
        if (!token || !action || (action === 'join' && !tournamentId)) {
            connection.socket.close(4001, 'Missing or invalid parameters');
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
        tournamentSockets.set(userId, socket);
        console.log(`🌐 [Tournament WS] Opened for Player: ${userId}`);
        socket.send(JSON.stringify({ type: 'tournamentJoined', id: tournament.id }));
        socket.on('message', (msg) => {
            const text = msg.toString();
            if (text === 'pong')
                return;
            try {
                const data = JSON.parse(text);
                if (data.type === 'quitTournament') {
                    (0, tournament_manager_1.quitTournament)(userId);
                    tournamentSockets.delete(userId);
                    socket.send(JSON.stringify({ type: 'tournamentLeft' }));
                }
            }
            catch (err) {
                console.warn('📛 [Tournament WS] Invalid message:', text);
            }
        });
        socket.on('close', () => {
            (0, tournament_manager_1.quitTournament)(userId);
            tournamentSockets.delete(userId);
            console.log(`🚫 [Tournament WS] Closed for ${userId}`);
        });
    });
};
exports.default = (0, fastify_plugin_1.default)(tournamentPlugin);
//# sourceMappingURL=tournament.js.map