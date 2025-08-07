import { renderNav } from './nav';
import { renderBackgroundTop } from '../utils/layout';
import { wsManager } from '../websocket/ws-manager';
import { getToken, validateLogin } from '../utils/auth';
import { COLORS } from '../constants/colors';

export async function renderGame(root: HTMLElement) {
  const isValid = await validateLogin();
  if (!isValid) {
    location.hash = '#/login';
    return;
  }

  root.innerHTML = renderNav() + `
    <!-- Main Container with Background -->
    <div class="fixed inset-0 bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 overflow-hidden">

      <!-- Floating Particles -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div class="absolute top-40 right-32 w-40 h-40 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style="animation-delay: 2s;"></div>
        <div class="absolute bottom-32 left-1/3 w-36 h-36 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style="animation-delay: 4s;"></div>
      </div>

      <!-- Main Content -->
      <div class="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div class="max-w-5xl w-full">

          <!-- Header Section -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center mb-4">
              <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
            </div>
            <h1 class="text-5xl md:text-6xl font-black mb-3 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent drop-shadow-2xl flex items-center justify-center gap-1">
              <span>P</span><div class="ball-shape"></div><span>NG</span> <span>ARENA</span>
            </h1>
            <p class="text-lg md:text-xl text-blue-100 font-light max-w-2xl mx-auto leading-relaxed">
              Enter the ultimate battle arena where reflexes meet strategy
            </p>
          </div>

          <!-- Game Mode Selection -->
          <div class="grid lg:grid-cols-3 gap-6 mb-10">

            <!-- Solo Mode Card -->
            <div class="group relative">
              <div class="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <button id="play-alone" class="relative w-full backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/20 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl">
                <div class="text-center space-y-4">
                  <div class="w-16 h-16 mx-auto bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:rotate-12 transition-transform duration-500">
                    <span class="text-2xl">🤖</span>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-white mb-2">Solo Training</h3>
                    <p class="text-blue-200 text-sm leading-relaxed">Perfect your skills against our advanced AI opponent</p>
                  </div>
                  <div class="flex items-center justify-center space-x-2 text-blue-300 text-xs">
                    <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>AI Difficulty: Adaptive</span>
                  </div>
                </div>
              </button>
            </div>

            <!-- Online Mode Card -->
            <div class="group relative">
              <div class="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <button id="play-online" class="relative w-full backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/20 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl">
                <div class="text-center space-y-4">
                  <div class="w-16 h-16 mx-auto bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:rotate-12 transition-transform duration-500">
                    <span class="text-2xl">⚔️</span>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-white mb-2">1v1 Duel</h3>
                    <p class="text-purple-200 text-sm leading-relaxed">Challenge players worldwide in real-time combat</p>
                  </div>
                  <div class="flex items-center justify-center space-x-2 text-purple-300 text-xs">
                    <div class="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    <span>Live Multiplayer</span>
                  </div>
                </div>
              </button>
            </div>

            <!-- Tournament Mode Card -->
            <div class="group relative">
              <div class="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <button id="play-tournament" class="relative w-full backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/20 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl">
                <div class="text-center space-y-4">
                  <div class="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:rotate-12 transition-transform duration-500">
                    <span class="text-2xl">🏆</span>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-white mb-2">Tournament</h3>
                    <p class="text-yellow-200 text-sm leading-relaxed">Compete in championship brackets for ultimate glory</p>
                  </div>
                  <div class="flex items-center justify-center space-x-2 text-yellow-300 text-xs">
                    <div class="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span>Competitive Ranking</span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Game Canvas Section -->
          <div class="text-center mb-8">
            <!-- Countdown Display -->
            <div id="countdown" class="text-7xl md:text-8xl font-black text-white mb-8 hidden animate-bounce drop-shadow-2xl">
              <span class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">3</span>
            </div>

            <!-- Game Canvas -->
            <div class="inline-block relative">
              <div class="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl"></div>
              <canvas id="pong" width="700" height="400"
                      class="relative backdrop-blur-xl bg-black/30 border-2 border-white/30 rounded-3xl shadow-2xl hidden transform transition-all duration-700 hover:scale-105">
              </canvas>
            </div>
          </div>

          <!-- Game Information Panel -->
          <div class="max-w-3xl mx-auto">
            <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
              <div class="text-center mb-4">
                <p id="info" class="text-lg text-white font-medium">
                  🎮 Choose your battlefield and prove your dominance
                </p>
              </div>

              <!-- Control Instructions -->
              <div class="grid md:grid-cols-3 gap-4 text-center">
                <div class="space-y-2">
                  <div class="w-10 h-10 mx-auto bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 class="text-white font-semibold text-sm">Movement</h4>
                    <p class="text-blue-200 text-xs">↑/↓ Arrow Keys or W/S</p>
                  </div>
                </div>

                <div class="space-y-2">
                  <div class="w-10 h-10 mx-auto bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 class="text-white font-semibold text-sm">Real-time</h4>
                    <p class="text-purple-200 text-xs">Lightning-fast gameplay</p>
                  </div>
                </div>

                <div class="space-y-2">
                  <div class="w-10 h-10 mx-auto bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 class="text-white font-semibold text-sm">Scoring</h4>
                    <p class="text-yellow-200 text-xs">First to 11 points wins</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <style>
      /* Ball Shape Animation */
      @keyframes ball-bounce {
        0% {
          transform: translateY(0) scale(1);
        }
        12% {
          transform: translateY(-25px) scale(1);
        }
        25% {
          transform: translateY(0) scale(1);
        }
        37% {
          transform: translateY(-18px) scale(1);
        }
        50% {
          transform: translateY(0) scale(1);
        }
        62% {
          transform: translateY(-12px) scale(1);
        }
        75% {
          transform: translateY(0) scale(1);
        }
        87% {
          transform: translateY(-6px) scale(1);
        }
        100% {
          transform: translateY(0) scale(1);
        }
      }

      @keyframes ball-glow {
        0%, 100% {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.8),
                      0 0 40px rgba(29, 78, 216, 0.6),
                      0 0 60px rgba(30, 64, 175, 0.4),
                      inset 0 0 20px rgba(255, 255, 255, 0.2),
                      inset 0 0 30px rgba(59, 130, 246, 0.3);
        }
        25%, 75% {
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.6),
                      0 0 30px rgba(29, 78, 216, 0.4),
                      0 0 45px rgba(30, 64, 175, 0.3),
                      inset 0 0 15px rgba(255, 255, 255, 0.15),
                      inset 0 0 25px rgba(59, 130, 246, 0.25);
        }
        50% {
          box-shadow: 0 0 30px rgba(59, 130, 246, 1),
                      0 0 60px rgba(29, 78, 216, 0.9),
                      0 0 90px rgba(30, 64, 175, 0.7),
                      0 0 120px rgba(30, 58, 138, 0.5),
                      inset 0 0 25px rgba(255, 255, 255, 0.3),
                      inset 0 0 40px rgba(59, 130, 246, 0.4);
        }
      }

      @keyframes shine-highlight {
        0%, 100% {
          opacity: 0.6;
          transform: scale(1);
        }
        25%, 75% {
          opacity: 0.5;
          transform: scale(0.95);
        }
        50% {
          opacity: 1;
          transform: scale(1.1);
        }
      }

      .ball-shape {
        width: 3rem;
        height: 3rem;
        background:
          radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.1) 30%, transparent 40%),
          radial-gradient(circle at 70% 70%, rgba(0, 0, 0, 0.3) 0%, transparent 30%),
          linear-gradient(45deg, #60a5fa 0%, #3b82f6 25%, #1d4ed8 50%, #1e40af 75%, #1e3a8a 100%);
        border-radius: 50%;
        display: inline-block;
        position: relative;
        animation: ball-bounce 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite,
                   ball-glow 2s ease-in-out infinite;
        margin: 0 0.25rem;
        border: 3px solid rgba(255, 255, 255, 0.4);
        box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.2),
                    inset 0 0 30px rgba(59, 130, 246, 0.3);
      }

      .ball-shape::before {
        content: '';
        position: absolute;
        top: 15%;
        left: 25%;
        width: 35%;
        height: 35%;
        background:
          radial-gradient(ellipse 60% 40% at 40% 30%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.7) 20%, rgba(255, 255, 255, 0.2) 60%, transparent 100%);
        border-radius: 50%;
        animation: shine-highlight 2s ease-in-out infinite;
        filter: blur(0.5px);
      }

      .ball-shape::after {
        content: '';
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 40px;
        height: 6px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 50%;
        animation: shadow-scale 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
      }

      @keyframes shine-highlight {
        0%, 100% {
          opacity: 0.6;
          transform: scale(1);
        }
        50% {
          opacity: 1;
          transform: scale(1.1);
        }
      }

      @keyframes shadow-scale {
        0% {
          transform: translateX(-50%) scale(1);
          opacity: 0.3;
        }
        12% {
          transform: translateX(-50%) scale(0.6);
          opacity: 0.1;
        }
        25% {
          transform: translateX(-50%) scale(1);
          opacity: 0.3;
        }
        37% {
          transform: translateX(-50%) scale(0.7);
          opacity: 0.15;
        }
        50% {
          transform: translateX(-50%) scale(1);
          opacity: 0.3;
        }
        62% {
          transform: translateX(-50%) scale(0.8);
          opacity: 0.2;
        }
        75% {
          transform: translateX(-50%) scale(1);
          opacity: 0.3;
        }
        87% {
          transform: translateX(-50%) scale(0.9);
          opacity: 0.25;
        }
        100% {
          transform: translateX(-50%) scale(1);
          opacity: 0.3;
        }
      }

      /* Card Hover Effects */
      .group:hover .absolute.-inset-1 {
        animation: border-spin 2s linear infinite;
      }

      @keyframes border-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      /* Glowing Text Effect */
      .text-glow {
        text-shadow: 0 0 20px rgba(59, 130, 246, 0.5),
                     0 0 40px rgba(59, 130, 246, 0.3),
                     0 0 60px rgba(59, 130, 246, 0.1);
      }
    </style>
  `;

  const canvas = document.getElementById('pong') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  const info = document.getElementById('info')!;
  const countdown = document.getElementById('countdown')!;
  const width = 700; // Updated canvas width to fit better
  const height = 400; // Updated canvas height to fit better

  const VIRTUAL_WIDTH = 100;
  const VIRTUAL_HEIGHT = 100;
  const PADDLE_HEIGHT = 20;

  const scaleX = width / VIRTUAL_WIDTH;
  const scaleY = height / VIRTUAL_HEIGHT;

  let socket: WebSocket | null = null;
  let gameState: any = null;
  let moveInterval: number | null = null;

  const heldKeys: Record<string, boolean> = {};

  const cleanupListeners = () => {
    document.removeEventListener('keydown', keyDownHandler);
    document.removeEventListener('keyup', keyUpHandler);
    if (moveInterval !== null) {
      clearInterval(moveInterval);
      moveInterval = null;
    }
  };

  const keyDownHandler = (e: KeyboardEvent) => {
    heldKeys[e.key] = true;
  };

  const keyUpHandler = (e: KeyboardEvent) => {
    heldKeys[e.key] = false;
  };

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

    cleanupListeners();
    wsManager.disconnectGameSocket();
    gameState = null;

    info.textContent =
      mode === 'solo'
        ? 'Solo mode: Use W/S for left paddle, ↑/↓ for right paddle'
        : 'Online mode: Use ↑/↓ arrows. Waiting for opponent...';

    socket = wsManager.createGameSocket(mode);
    if (!socket) {
      alert('❌ Failed to create game socket');
      return;
    }

    socket.onmessage = (event) => {
      if (event.data === 'ping') {
        socket?.send('pong');
        return;
      }

      let msg: any;
      try {
        msg = JSON.parse(event.data);
      } catch {
        console.warn('⚠️ Invalid game message:', event.data);
        return;
      }

      if (msg.type === 'countdown') {
        countdown.classList.remove('hidden');
        countdown.textContent = msg.value;
        if (msg.value === 0) {
          countdown.classList.add('hidden');
          canvas.classList.remove('hidden');
        }
      } else if (msg.type === 'update') {
        gameState = msg.state;
      } else if (msg.type === 'end') {
        const myId = Object.keys(gameState?.score || {})[0];
        const winnerId = msg.winner;
        const resultMsg =
          winnerId === myId ? '🏆 You win!' : winnerId ? '❌ You lose!' : 'Game ended.';
        alert(`🏁 Game over!\n${resultMsg}`);
        wsManager.disconnectGameSocket();
        cleanupListeners();
      } else if (msg.type === 'disconnect') {
        alert(`❌ Opponent disconnected`);
        wsManager.disconnectGameSocket();
        cleanupListeners();
      }
    };

    socket.onerror = (err) => {
      console.error('❌ Game socket error:', err);
      alert('❌ Connection error. Try again.');
      cleanupListeners();
      wsManager.disconnectGameSocket();
    };

    socket.onclose = () => {
      console.log('❌ Game WebSocket closed');
    };

    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

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
      ctx.fillStyle = 'white';
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
        ctx.fillStyle = isMainPlayer ? COLORS.squidGame.greenDark : COLORS.squidGame.pinkDark;
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
