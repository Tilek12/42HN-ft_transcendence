"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderGame = renderGame;
const nav_1 = require("./nav");
const layout_1 = require("../utils/layout");
const ws_manager_1 = require("../websocket/ws-manager");
const auth_1 = require("../utils/auth");
const colors_1 = require("../constants/colors");
async function renderGame(root) {
    const isValid = await (0, auth_1.validateLogin)();
    if (!isValid) {
        location.hash = '#/login';
        return;
    }
    root.innerHTML = (0, nav_1.renderNav)() + (0, layout_1.renderBackgroundTop)(`
    <div class="pt-24 max-w-xl mx-auto text-white text-center">
      <h1 class="text-3xl font-bold mb-6">Pong Game</h1>
      <div class="flex justify-center gap-4 mb-8">
        <button id="play-alone" class="bg-[#037a76] text-white px-4 py-2 rounded shadow hover:bg-[#249f9c] transition">Play Alone</button>
        <button id="play-online" class="bg-[#ed1b76] text-white px-4 py-2 rounded shadow hover:bg-[#f44786] transition">Play Online (1v1)</button>
        <button id="play-tournament" class="bg-[#facc15] text-black px-4 py-2 rounded shadow hover:bg-[#fbbf24] transition">Play Tournament</button>
      </div>
      <div id="countdown" class="text-6xl font-bold text-white mb-6 hidden">5</div>
      <canvas id="pong" width="600" height="400" class="mx-auto border border-white/30 bg-white/10 backdrop-blur-md rounded shadow-lg hidden"></canvas>
      <p id="info" class="mt-6 text-gray-200 text-sm">Choose a game mode to begin</p>
    </div>
  `);
    const canvas = document.getElementById('pong');
    const ctx = canvas.getContext('2d');
    const info = document.getElementById('info');
    const countdown = document.getElementById('countdown');
    const width = canvas.width;
    const height = canvas.height;
    const VIRTUAL_WIDTH = 100;
    const VIRTUAL_HEIGHT = 100;
    const PADDLE_HEIGHT = 20;
    const scaleX = width / VIRTUAL_WIDTH;
    const scaleY = height / VIRTUAL_HEIGHT;
    let socket = null;
    let gameState = null;
    let moveInterval = null;
    const heldKeys = {};
    const cleanupListeners = () => {
        document.removeEventListener('keydown', keyDownHandler);
        document.removeEventListener('keyup', keyUpHandler);
        if (moveInterval !== null) {
            clearInterval(moveInterval);
            moveInterval = null;
        }
    };
    const keyDownHandler = (e) => {
        heldKeys[e.key] = true;
    };
    const keyUpHandler = (e) => {
        heldKeys[e.key] = false;
    };
    document.getElementById('play-alone').addEventListener('click', () => startGame('solo'));
    document.getElementById('play-online').addEventListener('click', () => startGame('duel'));
    document.getElementById('play-tournament').addEventListener('click', () => {
        location.hash = '#/tournament';
    });
    function startGame(mode) {
        const token = (0, auth_1.getToken)();
        if (!token) {
            alert('❌ You must be logged in to play');
            location.hash = '#/login';
            return;
        }
        cleanupListeners();
        ws_manager_1.wsManager.disconnectGameSocket();
        gameState = null;
        info.textContent =
            mode === 'solo'
                ? 'Solo mode: Use W/S for left paddle, ↑/↓ for right paddle'
                : 'Online mode: Use ↑/↓ arrows. Waiting for opponent...';
        socket = ws_manager_1.wsManager.createGameSocket(mode);
        if (!socket) {
            alert('❌ Failed to create game socket');
            return;
        }
        socket.onmessage = (event) => {
            if (event.data === 'ping') {
                socket?.send('pong');
                return;
            }
            let msg;
            try {
                msg = JSON.parse(event.data);
            }
            catch {
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
            }
            else if (msg.type === 'update') {
                gameState = msg.state;
            }
            else if (msg.type === 'end') {
                const myId = Object.keys(gameState?.score || {})[0];
                const winnerId = msg.winner;
                const resultMsg = winnerId === myId ? '🏆 You win!' : winnerId ? '❌ You lose!' : 'Game ended.';
                alert(`🏁 Game over!\n${resultMsg}`);
                ws_manager_1.wsManager.disconnectGameSocket();
                cleanupListeners();
            }
            else if (msg.type === 'disconnect') {
                alert(`❌ Opponent disconnected`);
                ws_manager_1.wsManager.disconnectGameSocket();
                cleanupListeners();
            }
        };
        socket.onerror = (err) => {
            console.error('❌ Game socket error:', err);
            alert('❌ Connection error. Try again.');
            cleanupListeners();
            ws_manager_1.wsManager.disconnectGameSocket();
        };
        socket.onclose = () => {
            console.log('❌ Game WebSocket closed');
        };
        document.addEventListener('keydown', keyDownHandler);
        document.addEventListener('keyup', keyUpHandler);
        moveInterval = setInterval(() => {
            if (!socket || socket.readyState !== WebSocket.OPEN)
                return;
            if (heldKeys['ArrowUp'])
                socket.send(JSON.stringify({ type: 'move', direction: 'up', side: 'right' }));
            if (heldKeys['ArrowDown'])
                socket.send(JSON.stringify({ type: 'move', direction: 'down', side: 'right' }));
            if (heldKeys['w'])
                socket.send(JSON.stringify({ type: 'move', direction: 'up', side: 'left' }));
            if (heldKeys['s'])
                socket.send(JSON.stringify({ type: 'move', direction: 'down', side: 'left' }));
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
                ctx.fillStyle = isMainPlayer ? colors_1.COLORS.squidGame.greenDark : colors_1.COLORS.squidGame.pinkDark;
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
//# sourceMappingURL=game.js.map