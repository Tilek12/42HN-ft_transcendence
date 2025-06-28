import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { WebSocket as WS } from 'ws';
import { startGame } from '../engine/matchmaking';
import { Player } from '../engine/types';

interface ConnectedUser {
  id: string;
  socket: WebSocket;
  isAlive: boolean;
}

const connectedUsers: ConnectedUser[] = [];

const PING_INTERVAL_MS = 10000;

const wsConnectionPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    const userId = req.headers['sec-websocket-protocol'];
    const mode = req.url.includes('mode=solo') ? 'solo' : 'duel';

    if (!userId || typeof userId !== 'string') {
      connection.socket.close(1008, 'Invalid user');
      return;
    }

    const socket = connection.socket;

    // Track in heartbeat list
    const user: ConnectedUser = {
      id: userId,
      socket,
      isAlive: true
    };
    connectedUsers.push(user);
    console.log(`✅ User connected: ${userId}`);

    // Send player to matchmaking
    const player: Player = { id: userId, socket: connection.socket };
    startGame(player, mode);

    socket.on('message', (msg) => {
      const text = msg.toString();

      if (text === 'pong') {
        user.isAlive = true;
        return;
      }

      // Optional: log or ignore non-ping/pong messages here.
      // GameRoom handles move input internally per player.
    });

    socket.on('close', () => {
      console.log(`❌ User disconnected: ${userId}`);
      const index = connectedUsers.findIndex((u) => u.id === userId);
      if (index !== -1) connectedUsers.splice(index, 1);
      // GameRoom will also handle clean-up per match on player close.
    });
  });

  // Ping-pong heartbeat
  setInterval(() => {
    connectedUsers.forEach((user, i) => {
      if (user.socket.readyState !== WS.OPEN) return;

      if (!user.isAlive) {
        console.log(`💀 Removing dead user: ${user.id}`);
        user.socket.close();
        connectedUsers.splice(i, 1);
        return;
      }

      user.isAlive = false;
      user.socket.send('ping');
    });
  }, PING_INTERVAL_MS);
};

export default fp(wsConnectionPlugin);

