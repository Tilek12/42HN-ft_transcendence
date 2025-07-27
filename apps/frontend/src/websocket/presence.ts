import { getToken } from '../utils/auth';
import { disconnectGameSocket } from './game';

// Create Presence WebSocket connection
let socket: WebSocket | null = null;
let activeUsers = 0;
let activeTournaments: any[] = [];
let reconnectTimeout: any = null;
let retryAttempts = 0;
const maxRetries = 10; // stop after 5 failed tries

const listeners: Array<() => void> = [];

export function connectPresenceSocket() {
  const token = getToken();
  if (socket || !getToken()) return;

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://localhost:3000';
  const wsUrl = backendUrl.replace(/^http/, 'ws') + `/ws/presence?token=${token}`;
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log('👥 [Presence WS] Connected');
  };

  socket.onmessage = (event) => {
    if (event.data === 'ping') {
      socket?.send('pong');
      return;
    }

    try {
      const msg = JSON.parse(event.data);
      console.log('👥 [Presence WS] Message:', msg);
      if (msg.type === 'presenceUpdate') {
        activeUsers = msg.count || 0;
      } else if (msg.type === 'tournamentUpdate') {
        activeTournaments = msg.tournaments || [];
      }
      notifyListeners();
    } catch {
      console.warn('👥 [Presence WS] Invalid message:', event.data);
    }
  };

  socket.onclose = () => {
    console.log('👥 [Presence WS] Disconnected');
    socket = null;

    disconnectGameSocket();

    if (getToken()) {
      retryAttempts++;
      if (retryAttempts <= maxRetries) {
        console.log(`👥 [Presence WS] Retry attempt ${retryAttempts}/${maxRetries}`);
        reconnectTimeout = setTimeout(connectPresenceSocket, 3000);
      } else {
        console.warn(`👥 [Presence WS] Stopped trying to reconnect after ${maxRetries} attempts.`);
      }
    }
  };

  socket.onerror = () => {
    console.error('👥 [Presence WS] Error');
  };
}

export function disconnectPresenceSocket() {
  if (reconnectTimeout) clearTimeout(reconnectTimeout);
  if (socket) {
    socket.close();
    socket = null;
  }
}

export function getActiveTournaments() {
  return activeTournaments;
}

export function getActiveUserCount() {
  return activeUsers;
}

export function onPresenceUpdate(callback: () => void) {
  listeners.push(callback);
}

function notifyListeners() {
  listeners.forEach(cb => cb());
}
