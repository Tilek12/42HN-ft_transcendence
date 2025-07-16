import { renderNav } from './nav';
import { createGameSocket } from '../socket'
import { getToken } from '../utils/auth';

export function renderGame(root: HTMLElement) {
  root.innerHTML = renderNav() + `
    <h1 class="text-2xl font-bold mb-4">Pong Game</h1>
    <div class="flex justify-center gap-4 mb-6">
      <button id="play-alone" class="bg-blue-500 text-white px-4 py-2 rounded">Play Alone</button>
      <button id="play-online" class="bg-green-500 text-white px-4 py-2 rounded">Play Online</button>
    </div>
    <canvas id="pong" width="600" height="400" class="mx-auto border border-black bg-white hidden"></canvas>
    <p class="mt-4 text-gray-600 text-center" id="info">Choose a game mode to begin</p>
  `;

  const canvas = document.getElementById('pong') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  const info = document.getElementById('info')!;
  const width = canvas.width;
  const height = canvas.height;

  let socket: WebSocket | null = null;
  let gameState: any = null;

  document.getElementById('play-alone')!.addEventListener('click', () => startGame('solo'));
  document.getElementById('play-online')!.addEventListener('click', () => startGame('duel'));

  function startGame(mode: 'solo' | 'duel') {
    const token = getToken();
    if (!token) {
      alert('❌ You must be logged in to play');
      location.hash = '#/login';
      return;
    }

    if (socket) {
      socket.close();
      socket = null;
    }

    canvas.classList.remove('hidden');
    info.textContent = mode === 'solo'
      ? 'Solo mode: Use W/S for left paddle, ↑/↓ for right paddle'
      : 'Online mode: Use ↑/↓ arrows. Waiting for opponent...';

    // ✅ Create WebSocket connection now
    socket = createGameSocket(mode);

    socket.onmessage = (event) => {
      // ✅ Handle keep-alive ping-pong
      if (event.data === 'ping') {
        socket?.send('pong');
        return;
      }

      const msg = JSON.parse(event.data);

      if (msg.type === 'update') {
        gameState = msg.state;
      } else if (msg.type === 'end') {
        alert(`🏁 Game over! Winner: ${msg.winner}`);
        socket?.close();
        socket = null;
      } else if (msg.type === 'disconnect') {
        alert(`❌ Opponent disconnected`);
        socket?.close();
        socket = null;
      }
    };

    socket.onclose = (event) => {
      console.log('❌ WebSocket disconnected');
      console.log(`❗ Close code: ${event.code}, reason: ${event.reason}`);
    };

    // ✅ Player controls
    document.addEventListener('keydown', (e) => {
      if (!socket || socket.readyState !== WebSocket.OPEN) return;

      const move = (direction: 'up' | 'down', side: 'left' | 'right') => {
        socket!.send(JSON.stringify({ type: 'move', direction, side }));
      };

      if (e.key === 'ArrowUp') move('up', 'right');
      if (e.key === 'ArrowDown') move('down', 'right');
      if (e.key === 'w') move('up', 'left');
      if (e.key === 's') move('down', 'left');
    });

    // ✅ Render game state
    function draw() {
      ctx.clearRect(0, 0, width, height);

      if (gameState) {
        const scaleX = width / gameState.width;
        const scaleY = height / gameState.height;

        // Ball
        const ball = gameState.ball;
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(ball.x * scaleX, ball.y * scaleY, 5, 0, Math.PI * 2);
        ctx.fill();

        // Paddles
        ctx.fillStyle = 'blue';
        for (const playerId in gameState.paddles) {
          const y = gameState.paddles[playerId];
          const x = Object.keys(gameState.paddles).indexOf(playerId) === 0 ? 0 : width - 10;
          ctx.fillRect(x, y * scaleY, 10, 60);
        }

        // Scores
        ctx.fillStyle = 'gray';
        ctx.font = '16px sans-serif';
        let xOffset = 20;
        for (const id in gameState.score) {
          ctx.fillText(`${id}: ${gameState.score[id]}`, xOffset, 20);
          xOffset += 140;
        }
      }

      requestAnimationFrame(draw);
    }

    draw();
  }
}
