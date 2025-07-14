import { getToken } from "./utils/auth"

// Simulated user ID (⚠️ replace with real JWT-based ID later)
export const userId = 'user42'

// Create WebSocket only when needed (on game start)
export function createGameSocket(mode: 'solo' | 'duel'): WebSocket {
	const ip = import.meta.env.LOCAL_IP
	const port = import.meta.env.BACKEND_PORT
	const backendUrl = `https://${ip}:${port}` || 'https://localhost:3000'
	const wsUrl = backendUrl.replace(/^http/, 'ws') + `/ws?mode=${mode}`
	const token = getToken();

	const socket = new WebSocket(`${wsUrl}$token=${token}`)

	socket.onopen = () => {
	  console.log('✅ WebSocket connected')
	  socket.send('Hello from frontend!')
	}

	socket.onmessage = (event) => {
	  const msg = event.data
	  if (msg === 'ping') {
		socket.send('pong')
		console.log('🏓 Sent pong')
	  }
	}

	socket.onclose = () => {
	  console.log('❌ WebSocket disconnected')
	}

	return socket
  }
