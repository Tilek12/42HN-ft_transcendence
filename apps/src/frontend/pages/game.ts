
import { renderBackgroundTop } from '../utils/layout.js';
import { wsManager } from '../websocket/ws-manager.js';
import { getToken } from '../utils/auth.js';
import { COLORS } from '../constants/colors.js';
import { languageStore, translations_game_render, transelate_per_id } from './languages.js';


export async function renderGame(root: HTMLElement) {
	const tr = translations_game_render[languageStore.language];

	root.innerHTML = renderBackgroundTop(`
    <div class="pt-24 max-w-xl mx-auto text-white text-center">
      <h1 id="pong_game_header" class="text-3xl font-bold mb-6">${tr!.pong_game_header}</h1>
      <div class="flex justify-center gap-4 mb-8">
        <button id="play-alone" class="bg-[#037a76] text-white px-4 py-2 rounded shadow hover:bg-[#249f9c] transition">${tr!.play_alone}</button>
        <button id="play-online" class="bg-[#ed1b76] text-white px-4 py-2 rounded shadow hover:bg-[#f44786] transition">${tr!.play_online}</button>
        <button id="play-tournament" class="bg-[#facc15] text-black px-4 py-2 rounded shadow hover:bg-[#fbbf24] transition">${tr!.play_tournament}</button>
      </div>
      <div id="countdown" class="text-6xl font-bold text-white mb-6 hidden">5</div>
      <canvas id="pong" width="600" height="400" class="mx-auto border border-white/30 bg-white/10 backdrop-blur-md rounded shadow-lg hidden"></canvas>
      <p id="info" class="mt-6 text-gray-200 text-sm">${tr!.info}</p>
    </div>
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
	let moveInterval: number | null = null;
	let playerNames: Record<string, string> = {};

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
