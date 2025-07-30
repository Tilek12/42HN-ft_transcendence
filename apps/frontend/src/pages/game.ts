import { renderNav } from './nav';
import { createGameSocket, disconnectGameSocket } from '../websocket/game';
import { getToken, validateLogin } from '../utils/auth';
import { COLORS } from '../constants/colors';

export async function renderGame(root: HTMLElement) {
  const isValid = await validateLogin();
  if (!isValid) {
    location.hash = '#/login';
    return;
  }

  root.innerHTML =
    renderNav() +
    `
    <h1 class="text-2xl font-bold mb-4">Pong Game</h1>
    <div class="flex justify-center gap-4 mb-6">
      <button id="play-alone" class="bg-[#037a76] text-white px-4 py-2 rounded">Play Alone</button>
      <button id="play-online" class="bg-[#ed1b76] text-white px-4 py-2 rounded">Play Online (1v1)</button>
      <button id="play-tournament" class="bg-[#facc15] text-black px-4 py-2 rounded">Play Tournament</button>
    </div>
    <div id="countdown" class="text-6xl font-bold text-center text-gray-700 mb-4 hidden">5</div>
    <canvas id="pong" width="600" height="400" class="mx-auto border border-black bg-white hidden"></canvas>
    <p class="mt-4 text-gray-600 text-center" id="info">Choose a game mode to begin</p>
    `;

  const canvas = document.getElementById('pong') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  const info = document.getElementById('info')!;
  const countdown = document.getElementById('countdown')!;
  const width = canvas.width;
  const height = canvas.height;

  const VIRTUAL_WIDTH = 100;
  const VIRTUAL_HEIGHT = 100;
  const PADDLE_HEIGHT = 20;

  const scaleX = width / VIRTUAL_WIDTH;
  const scaleY = height / VIRTUAL_HEIGHT;

  let socket: WebSocket | null = null;
  let gameState: any = null;
  let moveInterval: NodeJS.Timeout | null = null;
  const heldKeys: Record<string, boolean> = {};

  document.getElementById('play-alone')!.addEventListener('click', () => startGame('solo'));
  document.getElementById('play-online')!.addEventListener('click', () => startGame('duel'));
  document.getElementById('play-tournament')!.addEventListener('click', () => {
    location.hash = '#/tournament';
  });

  function startGame(mode: 'solo' | 'duel') {
    const token = getToken();
    if (!token) {
      alert('❌ You must be logged in to play');
      location.hash = '#/login';
      return;
    }

    disconnectGameSocket();
    gameState = null;

    info.textContent =
      mode === 'solo'
        ? 'Solo mode: Use W/S for left paddle, ↑/↓ for right paddle'
        : 'Online mode: Use ↑/↓ arrows. Waiting for opponent...';

    socket = createGameSocket(mode);

    socket.onmessage = (event) => {
      if (event.data === 'ping') {
        socket?.send('pong');
        return;
      }

      const msg = JSON.parse(event.data);

      if (msg.type === 'countdown') {
        countdown.classList.remove('hidden');
        countdown.textContent = msg.value;
        if (msg.value === 0) {
          countdown.classList.add('hidden');
          canvas.classList.remove('hidden');
        }
        return;
      }

      if (msg.type === 'update') {
        gameState = msg.state;
      } else if (msg.type === 'end') {
        const myId = Object.keys(gameState?.score || {})[0];
        const winnerId = msg.winner;
        let resultMsg = 'Game ended';
        if (winnerId) {
          resultMsg = winnerId === myId ? '🏆 You win!' : '❌ You lose!';
        }
        alert(`🏁 Game over!\n${resultMsg}`);
        disconnectGameSocket();
        clearInterval(moveInterval!);
      } else if (msg.type === 'disconnect') {
        alert(`❌ Opponent disconnected`);
        disconnectGameSocket();
        clearInterval(moveInterval!);
      }
    };

    socket.onclose = () => {
      console.log('❌ Game WebSocket disconnected');
    };

    document.addEventListener('keydown', (e) => heldKeys[e.key] = true);
    document.addEventListener('keyup', (e) => heldKeys[e.key] = false);

    moveInterval = setInterval(() => {
      if (!socket || socket.readyState !== WebSocket.OPEN) return;
      if (heldKeys['ArrowUp']) socket.send(JSON.stringify({ type: 'move', direction: 'up', side: 'right' }));
      if (heldKeys['ArrowDown']) socket.send(JSON.stringify({ type: 'move', direction: 'down', side: 'right' }));
      if (heldKeys['w']) socket.send(JSON.stringify({ type: 'move', direction: 'up', side: 'left' }));
      if (heldKeys['s']) socket.send(JSON.stringify({ type: 'move', direction: 'down', side: 'left' }));
    }, 50);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    if (gameState) {
      const ball = gameState.ball;
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(ball.x * scaleX, ball.y * scaleY, 5, 0, Math.PI * 2);
      ctx.fill();

      const paddleHeight = PADDLE_HEIGHT * scaleY;
      const paddleWidth = 10;
      const ids = Object.keys(gameState.paddles);
      const mainPlayerId = Object.keys(gameState.score)[0];

      ids.forEach((id, index) => {
        const y = gameState.paddles[id] * scaleY;
        const x = index === 0 ? 0 : width - paddleWidth;
        const isMainPlayer = id === mainPlayerId;
        ctx.fillStyle = isMainPlayer ? COLORS.squidGame.greenLight : COLORS.squidGame.pinkLight;
        ctx.fillRect(x, y, paddleWidth, paddleHeight);
      });

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
