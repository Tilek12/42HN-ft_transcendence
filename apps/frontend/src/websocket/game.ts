import { getToken } from '../utils/auth'

// Create Game WebSocket connection
export function createGameSocket(mode: 'solo' | 'duel' | 'tournament', size?: number): WebSocket {
	const token = getToken();
	const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://localhost:3000';
	let wsUrl = backendUrl.replace(/^http/, 'ws') + `/ws/game?mode=${mode}&token=${token}`;

	if (mode === 'tournament' && size) {
		wsUrl += `&size=${size}`;
	}

	const socket = new WebSocket(wsUrl);

	socket.onopen = () => {
	  console.log('✅ Game WebSocket connected');
	};

	socket.onmessage = (event) => {
	  const msg = event.data;
	  if (msg === 'ping') {
		socket.send('pong');
	  }
	};

	socket.onclose = () => {
	  console.log('❌ Game WebSocket disconnected');
	};

	return socket;
}
