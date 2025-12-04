
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
      <!-- Floating Balls -->
      <div class="absolute top-1/4 left-1/4 w-4 h-4 bg-white/10 rounded-full animate-[ping_3s_ease-in-out_infinite]"></div>
      <div class="absolute top-1/3 right-1/4 w-6 h-6 bg-white/10 rounded-full animate-[ping_4s_ease-in-out_infinite_0.5s]"></div>
      <div class="absolute bottom-1/4 left-1/3 w-5 h-5 bg-white/10 rounded-full animate-[ping_3.5s_ease-in-out_infinite_1s]"></div>
      <div class="absolute top-2/3 right-1/3 w-4 h-4 bg-white/10 rounded-full animate-[ping_4.5s_ease-in-out_infinite_1.5s]"></div>
      
      <!-- Floating Paddles -->
      <div class="absolute top-1/2 left-8 w-2 h-20 bg-gradient-to-b from-[#037a76]/20 to-[#037a76]/5 rounded-full animate-[float_6s_ease-in-out_infinite]"></div>
      <div class="absolute top-1/3 right-8 w-2 h-20 bg-gradient-to-b from-[#ed1b76]/20 to-[#ed1b76]/5 rounded-full animate-[float_6s_ease-in-out_infinite_1s]"></div>
      
      <!-- Dotted Center Line -->
      <div class="absolute left-1/2 top-0 bottom-0 w-px flex flex-col justify-around items-center opacity-10">
        ${Array.from({ length: 20 }, () => '<div class="w-1 h-4 bg-white rounded-full"></div>').join('')}
      </div>
      
      <!-- Animated Grid Pattern -->
      <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] animate-[pulse_8s_ease-in-out_infinite]"></div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 pt-24 pb-12 max-w-5xl mx-auto px-4">
      <!-- Header Section -->
      <div class="text-center mb-12 space-y-4">
        <div class="inline-block">
          <h1 id="pong_game_header" class="text-5xl md:text-7xl font-black bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent animate-[pulse_3s_ease-in-out_infinite] tracking-tight">
            ${tr!.pong_game_header}
          </h1>
          <div class="h-1 w-3/4 mx-auto mt-4 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full"></div>
        </div>
        <p class="text-gray-300 text-lg animate-[fadeIn_1s_ease-in]">Choose a game mode to begin</p>
      </div>

      <!-- Game Mode Buttons -->
      <div class="flex flex-col md:flex-row justify-center items-center gap-6 mb-12">
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

        <!-- Play Tournament Button -->
        <button id="play-tournament" class="group relative w-full md:w-56 px-8 py-6 bg-gradient-to-br from-[#facc15] to-[#f59e0b] text-gray-900 rounded-2xl shadow-2xl shadow-[#facc15]/30 hover:shadow-[#facc15]/50 hover:scale-105 transition-all duration-300 overflow-hidden">
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]"></div>
          </div>
          <div class="relative flex flex-col items-center gap-2">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
            <span class="font-bold text-lg">${tr!.play_tournament}</span>
          </div>
        </button>
      </div>

      <!-- Countdown -->
      <div id="countdown" class="text-center mb-8 hidden">
        <div class="text-8xl md:text-9xl font-black text-white animate-[bounce_1s_ease-in-out] drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
          5
        </div>
      </div>

      <!-- Game Canvas -->
      <div class="flex justify-center mb-8">
        <div class="relative">
          <canvas id="pong" width="600" height="400" class="hidden rounded-3xl border-2 border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.1)] bg-gradient-to-br from-black/40 via-black/30 to-black/40 backdrop-blur-xl"></canvas>
          <div class="absolute inset-0 rounded-3xl bg-gradient-to-t from-white/5 to-transparent pointer-events-none hidden" id="canvas-glow"></div>
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
      .animate-fill-both { animation-fill-mode: both; }
    </style>
  `);
	languageStore.subscribe((lang) => {

		transelate_per_id(translations_game_render, "pong_game_header", lang, "pong_game_header");
		transelate_per_id(translations_game_render, "play_alone", lang, "play-alone");
		transelate_per_id(translations_game_render, "play_online", lang, "play-online");
		transelate_per_id(translations_game_render, "play_tournament", lang, "play-tournament");
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

	const heldKeys: Record<string, boolean> = {};

	const cleanupListeners = () => {
		document.removeEventListener('keydown', keyDownHandler);
		document.removeEventListener('keyup', keyUpHandler);
		if (moveInterval !== null) {
			clearInterval(moveInterval);
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
		const user = getUser();
		if (!user) {
			alert('❌ You must be logged in to play');
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

			switch (msg.type) {
				case 'start':
					console.log('Game started! Good luck!');
					break;
				case 'countdown':
					countdown.classList.remove('hidden');
					countdown.textContent = msg.value;
					if (msg.value === 0) {
						countdown.classList.add('hidden');
						canvas.classList.remove('hidden');
						document.getElementById('canvas-glow')?.classList.remove('hidden');
					}
					break;
				case 'update':
					gameState = msg.state;
					if (msg.state?.playerNames) {
						playerNames = msg.state.playerNames;
					}
					break;
				case 'end': {
					const myId = Object.keys(gameState?.score || {})[0];
					const winnerId = msg.winner;

					const winnerName = playerNames[winnerId] || 'Unknown';
					const myName = playerNames[myId!] || 'You';

					let resultMsg;
					if (winnerId === myId) {
						resultMsg = `🏆 ${myName} wins!`;
					} else {
						resultMsg = `❌ ${winnerName} wins!`;
					}

					alert(`🏁 Game over!\n${resultMsg}`);
					// wsManager.disconnectGameSocket();
					// cleanupListeners();
					break;
				}
				case 'disconnect':
					alert(`❌ Opponent disconnected`);
					wsManager.disconnectGameSocket();
					cleanupListeners();
					break;

				default:
					console.warn('⚠️ Unknown message type:', msg);
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
				const name = playerNames[id] || id;
				ctx.fillText(`${name}: ${gameState.score[id]}`, xOffset, 20);
				xOffset += 140;
			}
		}

		requestAnimationFrame(draw);
	}

	draw();
}
