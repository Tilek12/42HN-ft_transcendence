import { getToken } from "./utils/auth"

// Create game WebSocket connection
export function createGameSocket(mode: 'solo' | 'duel'): WebSocket {
	const token = getToken();
	const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://localhost:3000'
	const wsUrl = backendUrl.replace(/^http/, 'ws') + `/ws?mode=${mode}&token=${token}`

	// 🐞 Debug output
	console.log('[WS] Token:', token);
	console.log('[WS] URL:', wsUrl);

	const socket = new WebSocket(wsUrl)

	socket.onopen = () => {
	  console.log('✅ WebSocket connected')
	}

	socket.onmessage = (event) => {
	  const msg = event.data
	  if (msg === 'ping') {
		socket.send('pong')
	  }
	}

	socket.onclose = () => {
	  console.log('❌ WebSocket disconnected')
	}

	return socket
}
