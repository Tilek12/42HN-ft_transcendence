
import { renderBackgroundFull } from '../utils/layout.js';
import { wsManager } from '../websocket/ws-manager.js';
import { getUser } from '../utils/auth.js';
import { COLORS } from '../constants/colors.js';
import { languageStore, translations_game_render, transelate_per_id } from './languages.js';


export async function renderGame(root: HTMLElement) {
	const tr = translations_game_render[languageStore.language];

	root.innerHTML = renderBackgroundFull(/*html*/`
    <!-- Animated Pong Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <!-- Background Pong Game Canvas -->
      <canvas id="bg-pong" class="absolute inset-0 w-full h-full opacity-10"></canvas>

      <!-- Floating Balls -->
      <div class="absolute top-1/4 left-1/4 w-4 h-4 bg-white/10 rounded-full animate-[ping_3s_ease-in-out_infinite]"></div>
      <div class="absolute top-1/3 right-1/4 w-6 h-6 bg-white/10 rounded-full animate-[ping_4s_ease-in-out_infinite_0.5s]"></div>
      <div class="absolute bottom-1/4 left-1/3 w-5 h-5 bg-white/10 rounded-full animate-[ping_3.5s_ease-in-out_infinite_1s]"></div>
      <div class="absolute top-2/3 right-1/3 w-4 h-4 bg-white/10 rounded-full animate-[ping_4.5s_ease-in-out_infinite_1.5s]"></div>

      <!-- Animated Grid Pattern -->
      <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] animate-[pulse_8s_ease-in-out_infinite]"></div>
    </div>

    <!-- Main Content -->
    <div id="game-content" class="relative z-10 pt-24 pb-12 max-w-5xl mx-auto px-4 transition-all duration-500">
      <!-- Header Section -->
      <div id="game-header" class="text-center mb-12 space-y-4 transition-all duration-500">
        <div class="inline-block">
          <h1 id="pong_game_header" class="text-5xl md:text-7xl font-black bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent animate-[pulse_3s_ease-in-out_infinite] tracking-tight">
            ${tr!.pong_game_header}
          </h1>
          <div class="h-1 w-3/4 mx-auto mt-4 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full"></div>
        </div>
        <p class="text-gray-300 text-lg animate-[fadeIn_1s_ease-in]">Choose a game mode to begin</p>
      </div>

      <!-- Game Mode Buttons -->
      <div id="game-buttons" class="flex flex-col md:flex-row justify-center items-center gap-6 mb-12 transition-all duration-500">
        <!-- Play Alone Button -->
        <button id="play-alone" class="group relative w-full md:w-56 px-8 py-6 bg-gradient-to-br from-[#037a76] to-[#025a57] text-white rounded-2xl shadow-2xl shadow-[#037a76]/30 hover:shadow-[#037a76]/50 hover:scale-105 transition-all duration-300 overflow-hidden">
          <div class="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300"></div>
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]"></div>
          </div>
          <div class="relative flex flex-col items-center gap-2">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <span class="font-bold text-lg">${tr!.play_alone}</span>
          </div>
        </button>

        <!-- Play Online Button -->
        <button id="play-online" class="group relative w-full md:w-56 px-8 py-6 bg-gradient-to-br from-[#ed1b76] to-[#c01562] text-white rounded-2xl shadow-2xl shadow-[#ed1b76]/30 hover:shadow-[#ed1b76]/50 hover:scale-105 transition-all duration-300 overflow-hidden">
          <div class="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300"></div>
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]"></div>
          </div>
          <div class="relative flex flex-col items-center gap-2">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <span class="font-bold text-lg">${tr!.play_online}</span>
          </div>
        </button>

        <!-- Play Local Tournament Button -->
        <button id="play-local-tournament" class="group relative w-full md:w-56 px-8 py-6 bg-gradient-to-br from-[#94a3b8] to-[#38bdf8] text-gray-900 rounded-2xl shadow-2xl shadow-[#94a3b8]/30 hover:shadow-[#94a3b8]/50 hover:scale-105 transition-all duration-300 overflow-hidden">
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]"></div>
          </div>
          <div class="relative flex flex-col items-center gap-2">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
            <span class="font-bold text-lg">${tr!.play_local_tournament}</span>
          </div>
        </button>

		<!-- Play Online Tournament Button -->
		<button id="play-online-tournament" class="group relative w-full md:w-56 px-8 py-6 bg-gradient-to-br from-[#facc15] to-[#f59e0b] text-gray-900 rounded-2xl shadow-2xl shadow-[#facc15]/30 hover:shadow-[#facc15]/50 hover:scale-105 transition-all duration-300 overflow-hidden">
			<div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
			<div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
				<div class="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]"></div>
			</div>
			<div class="relative flex flex-col items-center gap-2">
				<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
				</svg>
				<span class="font-bold text-lg">${tr!.play_online_tournament}</span>
			</div>
		</button>
      </div>

      <!-- Countdown -->
      <!-- DESIGN CHANGE: Replaced simple countdown with fullscreen animated countdown featuring 20rem font size,
           purple/pink/orange gradient, fade in/out animations, scale effects, and purple glow -->
      <div id="countdown" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm hidden pointer-events-none">
        <div class="relative">
          <div id="countdown-number" class="text-[20rem] font-black bg-gradient-to-br from-purple-400 via-pink-500 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_0_60px_rgba(168,85,247,0.8)] transition-all duration-300">
            3
          </div>
          <div class="absolute inset-0 text-[20rem] font-black text-white/10 blur-3xl">
            3
          </div>
        </div>
      </div>

      <!-- Game Canvas -->
      <!-- DESIGN CHANGE: Removed CSS background gradients/borders from canvas, now uses pure JavaScript rendering -->
      <div id="canvas-container" class="flex justify-center mb-8">
        <div class="relative" id="canvas-wrapper">
          <canvas id="pong" width="1000" height="600" class="hidden rounded-2xl border-4 border-amber-900/50 shadow-[0_0_80px_rgba(255,140,0,0.3),0_0_40px_rgba(255,69,0,0.2)] bg-gradient-to-br from-green-900/30 via-green-800/20 to-green-900/30 backdrop-blur-xl"></canvas>
          <div class="absolute inset-0 rounded-2xl bg-gradient-to-t from-green-500/5 to-transparent pointer-events-none hidden" id="canvas-glow"></div>
        </div>
      </div>

      <!-- Game Over Modal -->
      <!-- DESIGN CHANGE: Custom modal with gradient "GAME OVER" text and Continue button,
           replacing simple alert for better UX -->
      <div id="game-over-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div class="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl border-4 border-white/10 p-8 max-w-md w-full mx-4 animate-[scaleIn_0.3s_ease-out]">
          <div class="text-center space-y-6">
            <div class="text-7xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              GAME<br>OVER
            </div>
            <button id="close-game-over" class="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-xl rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
              Continue
            </button>
          </div>
        </div>
      </div>

      <!-- Info Text -->
      <div class="text-center">
        <p id="info" class="text-gray-300 text-base md:text-lg px-4 py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 inline-block animate-[fadeIn_1s_ease-in_0.5s] animate-fill-both">
          ${tr!.info}
        </p>
      </div>
    </div>

    <style>
      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.8);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      @keyframes float {
        0%, 100% {
          transform: rotateX(10deg) translateY(0px) translateZ(50px);
        }
        50% {
          transform: rotateX(10deg) translateY(-10px) translateZ(50px);
        }
      }
      @keyframes glow {
        0%, 100% {
          filter: drop-shadow(0 0 30px rgba(255, 140, 0, 0.8)) drop-shadow(0 0 60px rgba(255, 100, 0, 0.4));
        }
        50% {
          filter: drop-shadow(0 0 50px rgba(255, 140, 0, 1)) drop-shadow(0 0 80px rgba(255, 100, 0, 0.6));
        }
      }
      .perspective-1000 {
        perspective: 1000px;
      }
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }
      @keyframes fire {
        0%, 100% { filter: brightness(1) blur(0px); }
        50% { filter: brightness(1.3) blur(1px); }
      }
      @keyframes glow {
        0%, 100% { box-shadow: 0 0 20px rgba(255, 69, 0, 0.3); }
        50% { box-shadow: 0 0 40px rgba(255, 140, 0, 0.6); }
      }
      .animate-fill-both { animation-fill-mode: both; }
    </style>
  `);
	languageStore.subscribe((lang) => {

		transelate_per_id(translations_game_render, "pong_game_header", lang, "pong_game_header");
		transelate_per_id(translations_game_render, "play_alone", lang, "play-alone");
		transelate_per_id(translations_game_render, "play_online", lang, "play-online");
		transelate_per_id(translations_game_render, "play_local_tournament", lang, "play-local-tournament");
		transelate_per_id(translations_game_render, "play_online_tournament", lang, "play-online-tournament");
		transelate_per_id(translations_game_render, "info", lang, "info");

	})

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
	let moveInterval: any = null;
	let playerNames: Record<string, string> = {};
	let animationTime = 0;

	const heldKeys: Record<string, boolean> = {};

	const cleanupListeners = () => {
		document.removeEventListener('keydown', keyDownHandler);
		document.removeEventListener('keyup', keyUpHandler);
		if (moveInterval !== null) {
			clearInterval(moveInterval);
		}
	};

	const keyDownHandler = (e: KeyboardEvent) => {
		// Prevent default behavior for arrow keys to stop page scrolling
		if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
			e.preventDefault();
		}
		heldKeys[e.key] = true;
	};

	const keyUpHandler = (e: KeyboardEvent) => {
		// Prevent default behavior for arrow keys
		if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
			e.preventDefault();
		}
		heldKeys[e.key] = false;
	};

	document.getElementById('play-alone')!.addEventListener('click', () => startGame('solo'));
	document.getElementById('play-online')!.addEventListener('click', () => startGame('duel'));
	document.getElementById('play-local-tournament')!.addEventListener('click', () => {
		location.hash = '#/local-tournament';
	});
	document.getElementById('play-online-tournament')!.addEventListener('click', () => {
		location.hash = '#/online-tournament';
	});

	// Game Over modal close handler
	document.getElementById('close-game-over')!.addEventListener('click', () => {
		const modal = document.getElementById('game-over-modal')!;
		modal.classList.add('hidden');

		// Exit fullscreen game mode - restore normal view
		const gameContent = document.getElementById('game-content');
		const gameHeader = document.getElementById('game-header');
		const gameButtons = document.getElementById('game-buttons');
		const canvasContainer = document.getElementById('canvas-container');
		const canvasWrapper = document.getElementById('canvas-wrapper');

		if (gameContent && gameHeader && gameButtons && canvasContainer && canvasWrapper) {
			// Restore normal layout
			gameContent.classList.remove('fixed', 'inset-0', 'p-0', 'm-0');
			gameContent.classList.add('pt-24', 'pb-12', 'max-w-5xl', 'mx-auto', 'px-4');

			// Restore canvas container
			canvasContainer.classList.remove('w-full', 'h-full', 'm-0', 'flex', 'items-center', 'justify-center');
			canvasContainer.classList.add('mb-8', 'flex', 'justify-center');

			// Reset canvas wrapper and canvas transform
			canvasWrapper.style.width = '';
			canvasWrapper.style.height = '';
			canvasWrapper.style.display = '';
			canvasWrapper.style.alignItems = '';
			canvasWrapper.style.justifyContent = '';
			canvas.style.transform = '';
			canvas.style.transformOrigin = '';

			// Show header and buttons
			gameHeader.classList.remove('hidden');
			gameButtons.classList.remove('hidden');
		}

		// Hide game elements
		canvas.classList.add('hidden');
		countdown.classList.add('hidden');
		document.getElementById('canvas-glow')?.classList.add('hidden');
	});

	function startGame(mode: 'solo' | 'duel') {

		const user = getUser();
		if (!user) {
			// alert('❌ You must be logged in to play');
			location.hash = '#/login';
			return;
		}

		cleanupListeners();
		// wsManager.disconnectGameSocket();
		gameState = null;

		info.textContent =
			mode === 'solo'
				? 'Solo mode: Use W/S for left paddle, ↑/↓ for right paddle'
				: 'Online mode: Use ↑/↓ arrows. Waiting for opponent...';
		const pong_status = document.getElementById('pong_status');
		socket = wsManager.createGameSocket(mode);
		if (!socket) {
			//alert('❌ Failed to create game socket');
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

			switch (msg.type) {
				case 'start':
					console.log('Game started! Good luck!');
					break;
			// DESIGN CHANGE: Added animated countdown with fade in/out and scale effects
			case 'countdown':
				if (msg.value > 0) {
					countdown.classList.remove('hidden');
					const countdownNumber = document.getElementById('countdown-number')!;

					// Update number
					countdownNumber.textContent = msg.value.toString();

					// Reset and trigger animation
					countdownNumber.style.opacity = '0';
					countdownNumber.style.transform = 'scale(0.5)';

					// Fade in and scale up
					setTimeout(() => {
						countdownNumber.style.opacity = '1';
						countdownNumber.style.transform = 'scale(1)';
					}, 10);

					// Fade out and scale up before next number
					setTimeout(() => {
						countdownNumber.style.opacity = '0';
						countdownNumber.style.transform = 'scale(1.3)';
					}, 700);
				} else if (msg.value === 0) {
					countdown.classList.add('hidden');
					canvas.classList.remove('hidden');
					document.getElementById('canvas-glow')?.classList.remove('hidden');

					// DESIGN CHANGE: Fullscreen game mode - hides header/buttons and scales canvas to 80% of viewport
					// Enter fullscreen game mode
						const gameContent = document.getElementById('game-content');
						const gameHeader = document.getElementById('game-header');
						const gameButtons = document.getElementById('game-buttons');
						const canvasContainer = document.getElementById('canvas-container');
						const canvasWrapper = document.getElementById('canvas-wrapper');

						if (gameContent && gameHeader && gameButtons && canvasContainer && canvasWrapper) {
							// Hide header and buttons
							gameHeader.classList.add('hidden');
							gameButtons.classList.add('hidden');

							// Make game content fill viewport
							gameContent.classList.remove('pt-24', 'pb-12', 'max-w-5xl', 'mx-auto', 'px-4');
							gameContent.classList.add('fixed', 'inset-0', 'p-0', 'm-0');

							// Make canvas container fill viewport and center content
							canvasContainer.classList.remove('mb-8', 'flex', 'justify-center');
							canvasContainer.classList.add('w-full', 'h-full', 'm-0', 'flex', 'items-center', 'justify-center');

							// Scale canvas to fill viewport while maintaining aspect ratio
							canvasWrapper.style.width = '100%';
							canvasWrapper.style.height = '100%';
							canvasWrapper.style.display = 'flex';
							canvasWrapper.style.alignItems = 'center';
							canvasWrapper.style.justifyContent = 'center';

							// Calculate scaling to fit 80% of viewport while maintaining 1000:600 aspect ratio
							const viewportWidth = window.innerWidth;
							const viewportHeight = window.innerHeight;
							const canvasAspect = 1000 / 600;
							const viewportAspect = viewportWidth / viewportHeight;

							let scale;
							if (viewportAspect > canvasAspect) {
								// Viewport is wider - scale by height (80% of viewport)
								scale = (viewportHeight * 0.8) / 600;
							} else {
								// Viewport is taller - scale by width (80% of viewport)
								scale = (viewportWidth * 0.8) / 1000;
							}

							canvas.style.transform = `scale(${scale})`;
							canvas.style.transformOrigin = 'center center';
						}
					}
					break;
				case 'update':
					gameState = msg.state;
					if (msg.state?.playerNames) {
						playerNames = msg.state.playerNames;
					}
					break;
				case 'end': {
					// Show Game Over modal
					const modal = document.getElementById('game-over-modal')!;
					modal.classList.remove('hidden');

					// Cleanup
					wsManager.disconnectGameSocket();
					cleanupListeners();
					gameState = null;
					playerNames = {};
					break;
				}
				case 'disconnect':
					// alert(`❌ Opponent disconnected`);
					wsManager.disconnectGameSocket();
					cleanupListeners();
					break;

				default:
					console.warn('⚠️ Unknown message type:', msg);
			}
		};

		socket.onerror = (err) => {
			console.error('❌ Game socket error:', err);
			// alert('❌ Connection error. Try again.');
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
		animationTime += 0.05;

		// Clear canvas
		ctx.clearRect(0, 0, width, height);

		// DESIGN CHANGE: Complete table redesign with purple header bar, diagonal separators,
		// centered scores/time display, dark game area - inspired by modern sports UI
		// ========== PURPLE HEADER BAR ==========

		// Solid dark background (consistent color)
		ctx.fillStyle = '#0a0a0f';
		ctx.fillRect(0, 0, width, height);

		// Center line (dashed white, subtle)
		ctx.save();
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
		ctx.lineWidth = 2;
		ctx.setLineDash([15, 15]);
		ctx.beginPath();
		ctx.moveTo(width / 2, 0);
		ctx.lineTo(width / 2, height);
		ctx.stroke();
		ctx.restore();

		if (gameState) {
			const ball = gameState.ball;
			const ballX = ball.x * scaleX;
			const ballY = ball.y * scaleY;
			const ballRadius = 10;

			// DESIGN CHANGE: Pink/purple ball with long motion trail (8 frames) for dramatic effect
			// ========== MODERN CLEAN BALL ==========
			ctx.save();

			// Motion trail effect
			for (let i = 0; i < 3; i++) {
				const trailX = ballX - (ball.dx * i * 2);
				const trailY = ballY - (ball.dy * i * 2);
				const trailAlpha = 0.15 - (i * 0.05);

				ctx.fillStyle = `rgba(200, 100, 255, ${trailAlpha})`;
				ctx.beginPath();
				ctx.arc(trailX, trailY, ballRadius, 0, Math.PI * 2);
				ctx.fill();
			}

			// Subtle glow
			const ballGlow = ctx.createRadialGradient(ballX, ballY, 0, ballX, ballY, ballRadius * 2.5);
			ballGlow.addColorStop(0, 'rgba(200, 100, 255, 0.4)');
			ballGlow.addColorStop(0.5, 'rgba(150, 80, 200, 0.2)');
			ballGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
			ctx.fillStyle = ballGlow;
			ctx.beginPath();
			ctx.arc(ballX, ballY, ballRadius * 2.5, 0, Math.PI * 2);
			ctx.fill();

			// Main ball with gradient
			const ballGradient = ctx.createRadialGradient(
				ballX - ballRadius * 0.3,
				ballY - ballRadius * 0.3,
				0,
				ballX,
				ballY,
				ballRadius
			);
			ballGradient.addColorStop(0, '#e8b3ff');
			ballGradient.addColorStop(0.5, '#c878dc');
			ballGradient.addColorStop(1, '#a050b8');

			ctx.fillStyle = ballGradient;
			ctx.beginPath();
			ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
			ctx.fill();

			// Small highlight
			const highlight = ctx.createRadialGradient(
				ballX - ballRadius * 0.4,
				ballY - ballRadius * 0.4,
				0,
				ballX - ballRadius * 0.4,
				ballY - ballRadius * 0.4,
				ballRadius * 0.5
			);
			highlight.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
			highlight.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)');
			highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
			ctx.fillStyle = highlight;
			ctx.beginPath();
			ctx.arc(ballX - ballRadius * 0.3, ballY - ballRadius * 0.3, ballRadius * 0.4, 0, Math.PI * 2);
			ctx.fill();

			ctx.restore();

			// ========== CLEAN MODERN PADDLES ==========
			const paddleHeight = PADDLE_HEIGHT * scaleY;
			const paddleWidth = 16;
			const cornerRadius = 8;
			const ids = Object.keys(gameState.paddles);
			const mainPlayerId = Object.keys(gameState.score)[0];

			ids.forEach((id, index) => {
				const paddleY = gameState.paddles[id] * scaleY;
				const paddleX = index === 0 ? 30 : width - paddleWidth - 30;
				const isMainPlayer = id === mainPlayerId;

				// Solid colors like reference image
				const paddleColor = isMainPlayer ? '#6b9dff' : '#ff8b6b';
				const glowColor = isMainPlayer ? '#4a7dd9' : '#e56847';

				ctx.save();

				// Subtle glow
				const paddleGlow = ctx.createRadialGradient(
					paddleX + paddleWidth/2,
					paddleY + paddleHeight/2,
					0,
					paddleX + paddleWidth/2,
					paddleY + paddleHeight/2,
					paddleHeight * 0.7
				);
				paddleGlow.addColorStop(0, paddleColor + '60');
				paddleGlow.addColorStop(0.6, paddleColor + '20');
				paddleGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
				ctx.fillStyle = paddleGlow;
				ctx.fillRect(paddleX - 15, paddleY - 15, paddleWidth + 30, paddleHeight + 30);

				// Main paddle - solid color with rounded corners
				ctx.fillStyle = paddleColor;
				ctx.beginPath();
				ctx.roundRect(paddleX, paddleY, paddleWidth, paddleHeight, cornerRadius);
				ctx.fill();

				// Subtle highlight on top edge
				const topHighlight = ctx.createLinearGradient(paddleX, paddleY, paddleX, paddleY + paddleHeight/4);
				topHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
				topHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
				ctx.fillStyle = topHighlight;
				ctx.beginPath();
				ctx.roundRect(paddleX + 2, paddleY + 2, paddleWidth - 4, paddleHeight / 4, cornerRadius);
				ctx.fill();

				ctx.restore();
			});

			// ========== CLEAN SCORES ==========
			ctx.save();
			ctx.font = 'bold 28px Arial, sans-serif';
			let scoreX = 60;

			for (const id in gameState.score) {
				const name = playerNames[id] || id;
				const text = `${name}: ${gameState.score[id]}`;

				// Simple white text with subtle shadow
				ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
				ctx.shadowBlur = 4;
				ctx.fillStyle = '#ffffff';
				ctx.fillText(text, scoreX, 45);

				scoreX += 320;
			}
			ctx.restore();
		}

		requestAnimationFrame(draw);
	}

	draw();

	// Background Pong Animation
	const bgCanvas = document.getElementById('bg-pong') as HTMLCanvasElement;
	const bgCtx = bgCanvas.getContext('2d')!;

	// Set canvas size to full screen
	const resizeBgCanvas = () => {
		bgCanvas.width = window.innerWidth;
		bgCanvas.height = window.innerHeight;
	};
	resizeBgCanvas();
	window.addEventListener('resize', resizeBgCanvas);

	// Background game state
	const bgGame = {
		ball: {
			x: bgCanvas.width / 2,
			y: bgCanvas.height / 2,
			dx: 3,
			dy: 3,
			radius: 8
		},
		paddles: {
			left: { y: bgCanvas.height / 2 - 60, height: 120, width: 12, speed: 4 },
			right: { y: bgCanvas.height / 2 - 60, height: 120, width: 12, speed: 4 }
		}
	};

	// Simple AI for paddles
	const updateBgPaddles = () => {
		// Left paddle follows ball with some lag
		const leftCenter = bgGame.paddles.left.y + bgGame.paddles.left.height / 2;
		if (bgGame.ball.y > leftCenter + 10) {
			bgGame.paddles.left.y += bgGame.paddles.left.speed;
		} else if (bgGame.ball.y < leftCenter - 10) {
			bgGame.paddles.left.y -= bgGame.paddles.left.speed;
		}

		// Right paddle follows ball with some lag
		const rightCenter = bgGame.paddles.right.y + bgGame.paddles.right.height / 2;
		if (bgGame.ball.y > rightCenter + 10) {
			bgGame.paddles.right.y += bgGame.paddles.right.speed;
		} else if (bgGame.ball.y < rightCenter - 10) {
			bgGame.paddles.right.y -= bgGame.paddles.right.speed;
		}

		// Keep paddles in bounds
		bgGame.paddles.left.y = Math.max(0, Math.min(bgCanvas.height - bgGame.paddles.left.height, bgGame.paddles.left.y));
		bgGame.paddles.right.y = Math.max(0, Math.min(bgCanvas.height - bgGame.paddles.right.height, bgGame.paddles.right.y));
	};

	// Update ball position and collision
	const updateBgBall = () => {
		bgGame.ball.x += bgGame.ball.dx;
		bgGame.ball.y += bgGame.ball.dy;

		// Top and bottom collision
		if (bgGame.ball.y - bgGame.ball.radius <= 0 || bgGame.ball.y + bgGame.ball.radius >= bgCanvas.height) {
			bgGame.ball.dy *= -1;
		}

		// Left paddle collision
		if (
			bgGame.ball.x - bgGame.ball.radius <= bgGame.paddles.left.width &&
			bgGame.ball.y >= bgGame.paddles.left.y &&
			bgGame.ball.y <= bgGame.paddles.left.y + bgGame.paddles.left.height
		) {
			bgGame.ball.dx = Math.abs(bgGame.ball.dx);
			// Add some variation to the angle
			bgGame.ball.dy += (Math.random() - 0.5) * 2;
		}

		// Right paddle collision
		if (
			bgGame.ball.x + bgGame.ball.radius >= bgCanvas.width - bgGame.paddles.right.width &&
			bgGame.ball.y >= bgGame.paddles.right.y &&
			bgGame.ball.y <= bgGame.paddles.right.y + bgGame.paddles.right.height
		) {
			bgGame.ball.dx = -Math.abs(bgGame.ball.dx);
			// Add some variation to the angle
			bgGame.ball.dy += (Math.random() - 0.5) * 2;
		}

		// Reset if ball goes out of bounds
		if (bgGame.ball.x < 0 || bgGame.ball.x > bgCanvas.width) {
			bgGame.ball.x = bgCanvas.width / 2;
			bgGame.ball.y = bgCanvas.height / 2;
			bgGame.ball.dx *= -1;
			bgGame.ball.dy = (Math.random() - 0.5) * 6;
		}

		// Limit ball speed
		bgGame.ball.dy = Math.max(-8, Math.min(8, bgGame.ball.dy));
	};

	// Draw background pong game
	const drawBgPong = () => {
		bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

		// Draw center line
		bgCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
		bgCtx.lineWidth = 2;
		bgCtx.setLineDash([15, 15]);
		bgCtx.beginPath();
		bgCtx.moveTo(bgCanvas.width / 2, 0);
		bgCtx.lineTo(bgCanvas.width / 2, bgCanvas.height);
		bgCtx.stroke();
		bgCtx.setLineDash([]);

		// Draw paddles with gradient
		const leftGradient = bgCtx.createLinearGradient(0, bgGame.paddles.left.y, 0, bgGame.paddles.left.y + bgGame.paddles.left.height);
		leftGradient.addColorStop(0, 'rgba(3, 122, 118, 0.3)');
		leftGradient.addColorStop(0.5, 'rgba(3, 122, 118, 0.5)');
		leftGradient.addColorStop(1, 'rgba(3, 122, 118, 0.3)');
		bgCtx.fillStyle = leftGradient;
		bgCtx.fillRect(0, bgGame.paddles.left.y, bgGame.paddles.left.width, bgGame.paddles.left.height);

		const rightGradient = bgCtx.createLinearGradient(bgCanvas.width - bgGame.paddles.right.width, bgGame.paddles.right.y, bgCanvas.width, bgGame.paddles.right.y + bgGame.paddles.right.height);
		rightGradient.addColorStop(0, 'rgba(237, 27, 118, 0.3)');
		rightGradient.addColorStop(0.5, 'rgba(237, 27, 118, 0.5)');
		rightGradient.addColorStop(1, 'rgba(237, 27, 118, 0.3)');
		bgCtx.fillStyle = rightGradient;
		bgCtx.fillRect(bgCanvas.width - bgGame.paddles.right.width, bgGame.paddles.right.y, bgGame.paddles.right.width, bgGame.paddles.right.height);

		// Draw ball with glow effect
		const ballGradient = bgCtx.createRadialGradient(bgGame.ball.x, bgGame.ball.y, 0, bgGame.ball.x, bgGame.ball.y, bgGame.ball.radius * 3);
		ballGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
		ballGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
		ballGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
		bgCtx.fillStyle = ballGradient;
		bgCtx.beginPath();
		bgCtx.arc(bgGame.ball.x, bgGame.ball.y, bgGame.ball.radius * 3, 0, Math.PI * 2);
		bgCtx.fill();

		// Draw solid ball
		bgCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
		bgCtx.beginPath();
		bgCtx.arc(bgGame.ball.x, bgGame.ball.y, bgGame.ball.radius, 0, Math.PI * 2);
		bgCtx.fill();

		// Update game state
		updateBgPaddles();
		updateBgBall();

		requestAnimationFrame(drawBgPong);
	};

	drawBgPong();
}
