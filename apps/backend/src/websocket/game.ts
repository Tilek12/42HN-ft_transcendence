import { FastifyPluginAsync } from 'fastify';
import { WebSocket as WS } from 'ws';
import fp from 'fastify-plugin';

import { startGame } from '../game/engine/matchmaking';
import { Player } from '../game/engine/types';

const connectedUsers: ConnectedUser[] = [];
const PING_INTERVAL_MS = 10000;

interface ConnectedUser {
  id: string;
  socket: WebSocket;
  isAlive: boolean;
}

const wsGamePlugin: FastifyPluginAsync = async (fastify) => {
  fastify.get('/game', { websocket: true }, async (connection, req) => {
    const url = req.url || '';
    const params = new URLSearchParams(url?.split('?')[1] || '');
    const mode = params.get('mode') ?? 'solo';
    const token = params.get('token');

    if (!token) {
      connection.socket.close(4001, 'Missing token');
      return;
    }

    let userId: string;
    try {
      const payload = await fastify.jwt.verify(token);
      userId = payload.id;
    } catch {
      connection.socket.close(4002, 'Invalid or expired token');
      return;
    }

    const socket = connection.socket;
    const player: Player = { id: userId, socket };

    connectedUsers.push({ id: userId, socket, isAlive: true });
    console.log(`🏓 [Game WS] Connected: ${userId} (${mode})`);

    // Only handle solo or duel games
    if (mode === 'duel' || mode === 'solo' || mode === 'tournament' ) {
      startGame(player, mode as 'solo' | 'duel' );  // tournament mode will be handled manually by tournament manager
    } else {
      console.warn(`⛔️ [Game WS] Invalid mode: ${mode}`);
      socket.close(4003, 'Unsupported mode');
      return;
    }

    socket.on('message', (msg) => {
      if (msg.toString() === 'pong') {
        const user = connectedUsers.find(u => u.id === userId);
        if (user) user.isAlive = true;
      }
    });

    socket.on('close', () => {
      console.log(`❌ [Game WS] Player disconnected: ${userId}`);
      const index = connectedUsers.findIndex(u => u.id === userId);
      if (index !== -1) connectedUsers.splice(index, 1);
    });
  });

  // Heartbeat
  setInterval(() => {
    connectedUsers.forEach((user, i) => {
      if (user.socket.readyState !== WS.OPEN) return;

      if (!user.isAlive) {
        console.log(`💀 [Game WS] Terminating inactive: ${user.id}`);
        user.socket.close();
        connectedUsers.splice(i, 1);
        return;
      }

      user.isAlive = false;
      user.socket.send('ping');
    });
  }, PING_INTERVAL_MS);
};

export default fp(wsGamePlugin);
