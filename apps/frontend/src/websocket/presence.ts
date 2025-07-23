import { getToken } from '../utils/auth';

// Create Presence WebSocket connection
let socket: WebSocket | null = null;
let activeUsers = 0;
let activeTournaments: any[] = [];
let reconnectTimeout: any = null;

const listeners: Array<() => void> = [];

export function connectPresenceSocket() {
  if (socket) return;

  const token = getToken();
  if (!token) return;

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://localhost:3000';
  const wsUrl = backendUrl.replace(/^http/, 'ws') + `/ws/presence?token=${token}`;
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log('✅ Presence WebSocket connected');
  };

  socket.onmessage = (event) => {
    if (event.data === 'ping') {
      socket?.send('pong');
      return;
    }

    try {
      const msg = JSON.parse(event.data);
      if (msg.type === 'presenceUpdate') {
        activeUsers = msg.count || 0;
        notifyListeners();
      } else if (msg.type === 'tournamentUpdate') {
        activeTournaments = msg.tournaments || [];
        notifyListeners();
      }
    } catch {
      console.warn('Unknown message format: ', event.data);
    }
  };

  socket.onclose = () => {
    console.log('❌ Presence WebSocket disconnected');
    socket = null;
    if (getToken()) {
      reconnectTimeout = setTimeout(connectPresenceSocket, 3000);
    }
  };

  socket.onerror = () => {
    console.error('⚠️ Presence socket error');
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
