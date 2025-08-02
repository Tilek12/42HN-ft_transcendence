import { getToken } from '../utils/auth';

let tournamentSocket: WebSocket | null = null;

type JoinOrCreate = 'join' | 'create';

export function createTournamentSocket(
  action: JoinOrCreate,
  size: 4 | 8,
  id?: string,
  onMessage?: (msg: any) => void
): WebSocket | null {
  const token = getToken();
  if (!token) return null;

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://localhost:3000';
  let wsUrl = backendUrl.replace(/^http/, 'ws') + `/ws/tournament?action=${action}&size=${size}&token=${token}`;
  if (action === 'join' && id) wsUrl += `&id=${id}`;

  tournamentSocket = new WebSocket(wsUrl);

  tournamentSocket.onopen = () => {
    console.log('🎯 [Tournament WS] Connected:', wsUrl);
  };

  tournamentSocket.onmessage = (event) => {
    if (event.data === 'ping') {
      tournamentSocket?.send('pong');
      return;
    }

    try {
      const msg = JSON.parse(event.data);
      console.log('🎯 [Tournament WS] Message:', msg);
      onMessage?.(msg);
    } catch (e) {
      console.warn('🎯 [Tournament WS] Invalid message:', event.data);
    }
  };

  tournamentSocket.onerror = (err) => {
    console.error('🎯 [Tournament WS] Error:', err);
  };

  tournamentSocket.onclose = () => {
    console.log('🎯 [Tournament WS] Disconnected');
    tournamentSocket = null;
  };

  return tournamentSocket;
}

export function quitTournament() {
  if (tournamentSocket?.readyState === WebSocket.OPEN) {
    console.log('🎯 [Tournament WS] Sending quitTournament');
    tournamentSocket.send(JSON.stringify({ type: 'quitTournament' }));
  }
}

export function disconnectTournamentSocket() {
  if (tournamentSocket) {
    console.log('🎯 [Tournament WS] Manually disconnecting');
    tournamentSocket.close();
    tournamentSocket = null;
  }
}
