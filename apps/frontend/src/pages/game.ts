import { renderNav } from './nav';
import { createGameSocket, userId } from '../socket'

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

    socket.onclose = () => {
      console.log('❌ WebSocket disconnected');
    };

    // ✅ Player controls
    document.addEventListener('keydown', (e) => {
      if (!socket || socket.readyState !== WebSocket.OPEN) return;

      if (e.key === 'ArrowUp') {
        socket.send(JSON.stringify({ type: 'move', direction: 'up', side: 'right' }));
      } else if (e.key === 'ArrowDown') {
        socket.send(JSON.stringify({ type: 'move', direction: 'down', side: 'right' }));
      } else if (e.key === 'w') {
        socket.send(JSON.stringify({ type: 'move', direction: 'up', side: 'left' }));
      } else if (e.key === 's') {
        socket.send(JSON.stringify({ type: 'move', direction: 'down', side: 'left' }));
      }
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
          const x = playerId === userId ? 0 : width - 10;
          ctx.fillRect(x, y * scaleY, 10, 60);
        }

        // Scores
        ctx.fillStyle = 'gray';
        ctx.font = '16px sans-serif';
        ctx.fillText(`You: ${gameState.score[userId] ?? 0}`, 20, 20);

        for (const id in gameState.score) {
          if (id !== userId) {
            ctx.fillText(`Opponent: ${gameState.score[id] ?? 0}`, width - 130, 20);
          }
        }
      }

      requestAnimationFrame(draw);
    }

    draw();
  }
}
