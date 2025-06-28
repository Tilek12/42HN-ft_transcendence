import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { WebSocket as WS } from 'ws';

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

    if (!userId || typeof userId !== 'string') {
      connection.socket.close(1008, 'Invalid user');
      return;
    }

    const user: ConnectedUser = {
      id: userId,
      socket: connection.socket,
      isAlive: true
    };

    connectedUsers.push(user);
    console.log(`✅ User connected: ${userId}`);

    connection.socket.on('message', (message) => {
      const text = message.toString();
      if (text === 'pong') {
        user.isAlive = true;
      } else {
        console.log(`[${userId}] says: ${text}`);
      }
    });

    connection.socket.on('close', () => {
      console.log(`❌ User disconnected: ${userId}`);
      const index = connectedUsers.findIndex((u) => u.id === userId);
      if (index !== -1) connectedUsers.splice(index, 1);
    });
  });

  // Global ping interval
  setInterval(() => {
    connectedUsers.forEach((user, i) => {
      if (user.socket.readyState !== WS.OPEN) return;

      if (!user.isAlive) {
        console.log(`💀 Removing dead user: ${user.id}`);
        user.socket.terminate?.(); // Not all runtimes support terminate(), use close() if needed
        connectedUsers.splice(i, 1);
        return;
      }

      user.isAlive = false;
      user.socket.send('ping');
    });
  }, PING_INTERVAL_MS);
};

export default fp(wsConnectionPlugin);
