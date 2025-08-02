import { renderNav } from './nav';
import { createGameSocket } from '../websocket/game';

export function renderTournamentMatch(root: HTMLElement) {
  const match = sessionStorage.getItem('currentTournamentMatch');
  if (!match) {
    alert('❌ No active tournament match');
    location.hash = '#/tournament';
    return;
  }

  const { tournamentId, matchId, player1, player2 } = JSON.parse(match);
  console.log(`🎮 Starting tournament match: ${matchId}`);

  root.innerHTML = renderNav() + `
    <h1 class="text-2xl font-bold mb-4">🏓 Tournament Match</h1>
    <p class="text-center text-gray-500 mb-2">Match: <strong>${matchId}</strong></p>
    <div id="countdown" class="text-6xl font-bold text-center text-gray-800 mb-2 hidden">5</div>
    <canvas id="pong" width="600" height="400" class="mx-auto border border-black bg-white hidden"></canvas>
    <p id="status" class="text-center text-gray-500 mt-4">Waiting for game to start...</p>
  `;

  const canvas = document.getElementById('pong') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  const status = document.getElementById('status')!;
  const countdown = document.getElementById('countdown')!;
  const width = canvas.width;
  const height = canvas.height;

  const scaleX = width / 100;
  const scaleY = height / 100;

  const socket = createGameSocket('tournament');

  let gameState: any = null;
  let moveInterval: any;
  let gameStarted = false;

  const heldKeys: Record<string, boolean> = {};

  socket.onmessage = (event) => {
    if (event.data === 'ping') {
      socket.send('pong');
      return;
    }

    const msg = JSON.parse(event.data);

    if (msg.type === 'countdown') {
      countdown.classList.remove('hidden');
      countdown.textContent = msg.value > 0 ? String(msg.value) : '';
      if (msg.value === 0) {
        countdown.classList.add('hidden');
      }
      return;
    }

    if (msg.type === 'start') {
      gameStarted = true;
      canvas.classList.remove('hidden');
      status.textContent = '🎮 Game started!';
      return;
    }

    if (msg.type === 'update') {
      if (gameStarted) gameState = msg.state;
    }

    if (msg.type === 'end') {
      const resultMsg = msg.winner === player1 ? `🏆 ${player1} wins!`
                      : msg.winner === player2 ? `🏆 ${player2} wins!`
                      : `🏁 Match over`;
      status.textContent = resultMsg;
      setTimeout(() => location.hash = '#/tournament', 3000);
    }

    if (msg.type === 'disconnect') {
      alert('❌ Opponent disconnected');
      location.hash = '#/tournament';
    }
  };

  document.addEventListener('keydown', (e) => heldKeys[e.key] = true);
  document.addEventListener('keyup', (e) => heldKeys[e.key] = false);

  moveInterval = setInterval(() => {
    if (!socket || socket.readyState !== WebSocket.OPEN || !gameStarted) return;
    if (heldKeys['ArrowUp']) socket.send(JSON.stringify({ type: 'move', direction: 'up', side: 'right' }));
    if (heldKeys['ArrowDown']) socket.send(JSON.stringify({ type: 'move', direction: 'down', side: 'right' }));
    if (heldKeys['w']) socket.send(JSON.stringify({ type: 'move', direction: 'up', side: 'left' }));
    if (heldKeys['s']) socket.send(JSON.stringify({ type: 'move', direction: 'down', side: 'left' }));
  }, 50);

  function draw() {
    ctx.clearRect(0, 0, width, height);
    if (gameState) {
      const ball = gameState.ball;
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(ball.x * scaleX, ball.y * scaleY, 5, 0, Math.PI * 2);
      ctx.fill();

      for (const [id, y] of Object.entries(gameState.paddles)) {
        const x = id === player1 ? 0 : width - 10;
        ctx.fillStyle = id === player1 ? '#10b981' : '#f43f5e'; // green/pink for players
        ctx.fillRect(x, (y as number) * scaleY, 10, 20 * scaleY);
      }
    }

    requestAnimationFrame(draw);
  }

  draw();
}
