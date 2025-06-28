// Simulated user ID (⚠️ replace with real JWT-based ID later)
export const userId = 'user42'

// Connect to WebSocket server
export const socket = new WebSocket('ws://localhost:3000/ws', userId)

socket.onopen = () => {
  console.log('✅ WebSocket connected')
  socket.send('Hello from frontend!')
}

socket.onmessage = (event) => {
	const msg = event.data;
	if (msg === 'ping') {
	  socket.send('pong');
	  console.log('🏓 Sent pong');
	}
  };

socket.onclose = () => {
  console.log('❌ WebSocket disconnected')
}
