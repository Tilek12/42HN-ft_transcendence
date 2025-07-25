import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import {
  Tournament,
  createTournament,
  joinTournament,
  quitTournament
} from '../game/tournament/tournament-manager';
import { Player } from '../game/engine/types';

const tournamentSockets: Map<string, WebSocket> = new Map();

const tournamentPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.get('/tournament', { websocket: true }, async (connection, req) => {
    const params = new URLSearchParams(req.url?.split('?')[1] || '');
    const token = params.get('token');
    const action = params.get('action'); // "create" or "join"
    const tournamentId = params.get('id');
    const size = parseInt(params.get('size') || '4') as 4 | 8;

    if (!token || !action || (action === 'join' && !tournamentId)) {
      connection.socket.close(4001, 'Missing or invalid parameters');
      return;
    }

    let userId: string;
    try {
      const payload = await fastify.jwt.verify(token);
      userId = payload.id;
    } catch {
      connection.socket.close(4002, 'Invalid token');
      return;
    }

    const socket = connection.socket;
    const player: Player = { id: userId, socket };

    let tournament: Tournament | null = null;
    if (action === 'create') {
      tournament = createTournament(player, size);
    } else if (action === 'join') {
      tournament = joinTournament(player, tournamentId!);
    }

    if (!tournament) {
      socket.send(JSON.stringify({ type: 'error', message: 'Could not join or create tournament' }));
      socket.close();
      return;
    }

    tournamentSockets.set(userId, socket);
    socket.send(JSON.stringify({ type: 'tournamentJoined', id: tournament.id }));

    socket.on('message', (msg) => {
      const text = msg.toString();
      if (text === 'pong') return;

      try {
        const data = JSON.parse(text);
        if (data.type === 'quitTournament') {
          quitTournament(userId);
          tournamentSockets.delete(userId);
          socket.send(JSON.stringify({ type: 'tournamentLeft' }));
        }
      } catch (err) {
        console.warn('Invalid tournament message:', text);
      }
    });

    socket.on('close', () => {
      quitTournament(userId);
      tournamentSockets.delete(userId);
      console.log(`🔴 Tournament WS closed for ${userId}`);
    });
  });
};

export default fp(tournamentPlugin);
