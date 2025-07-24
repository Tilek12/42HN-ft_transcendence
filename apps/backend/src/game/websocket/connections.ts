import { FastifyPluginAsync } from 'fastify';
import { WebSocket as WS } from 'ws';
import fp from 'fastify-plugin';

import { startGame } from '../engine/matchmaking';
import { Player } from '../engine/types';
import { joinTournament, getSafeTournamentData } from '../tournament/tournament-manager';
import {findProfileById } from '../../database/user'

const connectedUsers: ConnectedUser[] = [];
const PING_INTERVAL_MS = 10000;

interface ConnectedUser {
  logged_in: boolean;
  id: string;
  wins: number;
  losses: number;
  trophies: number;
  socket: WebSocket;
  isAlive: boolean;
}

function broadcastAll(msg: any) {
  const data = JSON.stringify(msg);
  connectedUsers.forEach(u => {
    if (u.socket.readyState === WS.OPEN) {
      u.socket.send(data);
    }
  });
}

const wsConnectionPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.get('/ws', { websocket: true }, async (connection, req) => {
    console.log('🌐 Incoming WS connection');
    const url = req.url || '';
    const params = new URLSearchParams(url?.split('?')[1] || '');
    const mode = params.get('mode') ?? 'solo';
    const token = params.get('token');
    const size = parseInt(params.get('size') || '4') as 4 | 8;

    // Validate token
    if (!token) {
      connection.socket.close(4001, 'Missing token');
      return;
    }

    let userId: string;
	let profile: any;
    try {
      const payload = await fastify.jwt.verify(token);
	  profile = await findProfileById(payload.id);
    } catch {
      connection.socket.close(4002, 'Invalid or expired token');
      return;
    }

    const socket = connection.socket;

    // Track in heartbeat list
    const user: ConnectedUser = {
	  logged_in: profile.logged_in,
      id: profile.id.toString(),
	  wins: profile.wins,
	  losses: profile.losses,
	  trophies:profile.trophies,
      socket,
      isAlive: true
    };
    connectedUsers.push(user);
    console.log(`✅ WebSocket connected: ${profile.id.toString()} (${mode})`);

    // Send player to matchmaking
    const player: Player = 
	{
		logged_in: profile.logged_in, 
		id: profile.id.toString(), 
		wins: profile.wins,
		losses: profile.losses, 
		trophies: profile.trophies, 
		socket
	};

    // Tournament defining
    if (mode === 'tournament') {
      const t = joinTournament(player, size);
      broadcastAll({ type: 'tournamentUpdate', tournaments: getSafeTournamentData() });
    } else {
      startGame(player, mode === 'duel' ? 'duel' : 'solo');
    }

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
        console.log(`💀 Terminating inactive: ${user.id}`);
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
