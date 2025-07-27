import { getToken } from '../utils/auth';

let gameSocket: WebSocket | null = null;

export function createGameSocket(mode: 'solo' | 'duel' | 'tournament', size?: number, id?: string): WebSocket {
  const token = getToken();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://localhost:3000';
  let wsUrl = backendUrl.replace(/^http/, 'ws') + `/ws/game?mode=${mode}&token=${token}`;

  if (mode === 'tournament' && size) {
    wsUrl += `&size=${size}`;
    if (id) wsUrl += `&id=${id}`;
  }

  gameSocket = new WebSocket(wsUrl);

  gameSocket.onopen = () => {
    console.log('🕹️ [Game WS] Connected');
  };

  gameSocket.onmessage = (event) => {
    if (event.data === 'ping') {
      gameSocket?.send('pong');
    } else {
      console.log('🕹️ [Game WS] Message:', event.data);
    }
  };

  gameSocket.onclose = () => {
    console.log('🕹️ [Game WS] Disconnected');
    gameSocket = null;
  };

  return gameSocket;
}

export function disconnectGameSocket() {
  if (gameSocket) {
    console.log('🕹️ [Game WS] Manually closing Game WebSocket 🔌');
    gameSocket.close();
    gameSocket = null;
  }
}
