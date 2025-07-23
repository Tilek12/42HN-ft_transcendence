import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { WebSocket as WS } from 'ws';
import { getSafeTournamentData } from '../game/tournament/tournament-manager';

interface PresenceUser {
  id: string;
  socket: WebSocket;
  isAlive: boolean;
}

const presenceUsers: PresenceUser[] = [];
const HEARTBEAT_INTERVAL = 10000;

function broadcastPresence(msg: any) {
  const data = JSON.stringify(msg);
  presenceUsers.forEach((user) => {
    if (user.socket.readyState === WS.OPEN) {
      user.socket.send(data);
    }
  });
}

export const getPresenceUsers = () => presenceUsers;
export const broadcastTournaments = () => {
  const tournaments = getSafeTournamentData();
  broadcastPresence({ type: 'tournamentUpdate', tournaments });
};

const presencePlugin: FastifyPluginAsync = async (fastify) => {
  fastify.get('/presence', { websocket: true }, async (connection, req) => {
    console.log('🌐 Incoming PRESENCE WS connection');
    const url = req.url || '';
    const params = new URLSearchParams(url?.split('?')[1] || '');
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
      connection.socket.close(4002, 'Invalid token');
      return;
    }

    const socket = connection.socket;
    const user: PresenceUser = {
      id: userId,
      socket,
      isAlive: true
    };
    presenceUsers.push(user);
    console.log(`🟢 Presence WS connected: ${userId}`);

    socket.on('message', (msg) => {
      if (msg.toString() === 'pong') {
        user.isAlive = true;
      }
    });

    socket.on('close', () => {
      const index = presenceUsers.findIndex((u) => u.id === userId);
      if (index !== -1) presenceUsers.splice(index, 1);
      console.log(`🔴 Presence WS disconnected: ${userId}`);
    });
  });

  setInterval(() => {
    presenceUsers.forEach((user, index) => {
      if (user.socket.readyState !== WS.OPEN) return;
      if (!user.isAlive) {
        console.log(`💀 Presence timeout: ${user.id}`);
        user.socket.close();
        presenceUsers.splice(index, 1);
        return;
      }
      user.isAlive = false;
      user.socket.send('ping');
    });
  }, HEARTBEAT_INTERVAL);
};

export default fp(presencePlugin);
