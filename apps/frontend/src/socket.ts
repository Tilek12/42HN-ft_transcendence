import { getToken } from "./utils/auth"

// Create WebSocket only when needed (on game start)
export function createGameSocket(mode: 'solo' | 'duel'): WebSocket {
	const token = getToken();
	const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://localhost:3000'
	const wsUrl = backendUrl.replace(/^http/, 'ws') + `/ws?mode=${mode}&token=${token}`

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
