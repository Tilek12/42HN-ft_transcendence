import { renderBackgroundFull } from '../utils/layout.js';
import { wsManager } from '../websocket/ws-manager.js';
import { COLORS } from '../constants/colors.js';
import { languageStore, translations_tournament_render, transelate_per_id } from './languages.js';

let currentMatch: any = null;
let currentMatchId: string | null = null;
let gameState: any = null;
let countdownValue: number | null = null;

export async function renderLocalTournament(root: HTMLElement) {

    root.innerHTML = renderBackgroundFull(/*html*/`
    <div class="max-w-4xl mx-auto m-8 p-6 bg-white/10 rounded-xl shadow-lg backdrop-blur-md">
        <h1 id="tournament_lobby_header" class="text-3xl font-bold mb-4 text-center text-white">
            ${translations_tournament_render[languageStore.language]!.tournament_lobby_header}
        </h1>
        <p id="glory_header" class="text-center text-gray-400 mb-6">
            ${translations_tournament_render[languageStore.language]!.glory_header}
        </p>

        <!-- Local only UI -->
        <div id="local-section">
            <div class="mb-4">
                <label class="block text-white mb-2">Tournament Size:</label>
                <select id="local-size" class="bg-white/20 text-white p-2 rounded">
                    <option value="4">4 Players</option>
                    <option value="8">8 Players</option>
                </select>
            </div>
            <div id="name-inputs" class="space-y-2"></div>
            <button id="create-local" class="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold mt-4">
                Create Local Tournament
            </button>
        </div>

        <div id="local-tournament" class="hidden mt-6">
            <div id="tournament-info" class="text-center text-gray-400 mb-4"></div>

            <!-- Matches table -->
            <div id="matches-table" class="mb-4"></div>

            <!-- countdown is only drawn inside the canvas now -->
            <p id="status" class="text-center text-gray-400 mb-4">Waiting for tournament to start...</p>
            <canvas id="pong" width="600" height="400" class="mx-auto border border-white/30 bg-white/10 backdrop-blur-md rounded shadow-lg hidden"></canvas>
            <div class="text-center mt-6">
                <button id="quit-local" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                    Quit Tournament
                </button>
            </div>
        </div>
    </div>
    `);

    // --- Translations stay as before ---
    languageStore.subscribe((lang) => {
        transelate_per_id(translations_tournament_render, "tournament_lobby_header", lang, "tournament_lobby_header");
        transelate_per_id(translations_tournament_render, "glory_header", lang, "glory_header");
        transelate_per_id(translations_tournament_render, "empty_p_msg", lang, "empty-p-msg");
        transelate_per_id(translations_tournament_render, "create_four_header", lang, "create-tournament-4");
        transelate_per_id(translations_tournament_render, "create_eight_header", lang, "create-tournament-8");
    });

    // ----- Local setup -----

    // Initial 4 players inputs
    updateNameInputs(4);

    // Size change
    document.getElementById('local-size')!.addEventListener('change', (e) => {
        const size = parseInt((e.target as HTMLSelectElement).value);
        updateNameInputs(size);
    });

    // Create local tournament
    document.getElementById('create-local')!.addEventListener('click', () => createLocalTournament());

    // Quit local tournament
    document.getElementById('quit-local')!.addEventListener('click', () => {
        try {
            wsManager.quitLocalTournament();
        } catch (err) {
            console.error('Error quitting local tournament:', err);
        }
        document.getElementById('local-tournament')!.classList.add('hidden');
        document.getElementById('local-section')!.classList.remove('hidden');
        // show glory header again when we go back to lobby
        const glory = document.getElementById('glory_header');
        if (glory) glory.classList.remove('hidden');

        currentMatch = null;
        currentMatchId = null;
        gameState = null;
        countdownValue = null;
        const matchesTable = document.getElementById('matches-table');
        if (matchesTable) matchesTable.innerHTML = '';
    });

    function updateNameInputs(size: number) {
        const container = document.getElementById('name-inputs')!;
        container.innerHTML = '';
        for (let i = 0; i < size; i += 2) {
            const row = document.createElement('div');
            row.className = 'flex space-x-4 mb-4';
            for (let j = 0; j < 2 && i + j < size; j++) {
                const playerNum = i + j + 1;
                const div = document.createElement('div');
                div.className = 'flex-1';
                div.innerHTML = /*html*/`
                    <label class="block text-white mb-2">Player ${playerNum}:</label>
                    <input type="text" class="name-input bg-white/20 text-white p-2 rounded w-full" placeholder="Name">
                `;
                row.appendChild(div);
            }
            container.appendChild(row);
        }
    }

    function createLocalTournament() {
        const size = Number((document.getElementById('local-size') as HTMLSelectElement).value);
        const names: string[] = [];
        let hasEmpty = false;

        document.querySelectorAll<HTMLInputElement>('.name-input').forEach(input => {
            const name = input.value.trim();
            if (!name) {
                hasEmpty = true;
            }
            names.push(name);
        });

        if (hasEmpty) {
            alert('All player names must be filled.');
            return;
        }
        if (names.length !== size) {
            console.error('Name count does not match size', { size, namesCount: names.length });
            alert('Internal error: player count mismatch.');
            return;
        }

        const socket = wsManager.connectLocalTournamentSocket(
            size === 4 ? 4 : 8,
            (msg) => {
                try {
                    handleLocalMessage(msg);
                } catch (err) {
                    console.error('Error handling local tournament message:', err, msg);
                }
            },
            names
        );

        if (!socket) {
            alert('Failed to create local tournament (no user or connection error).');
            return;
        }

        document.getElementById('local-section')!.classList.add('hidden');
        document.getElementById('local-tournament')!.classList.remove('hidden');
        // hide glory header after tournament starts
        const glory = document.getElementById('glory_header');
        if (glory) glory.classList.add('hidden');

        // Short info only once
        document.getElementById('tournament-info')!.textContent =
            `Local tournament with ${size} players.`;
    }

    function handleLocalMessage(msg: any) {
        console.log('Local tournament message:', msg);

        switch (msg.type) {
            case 'localTournamentCreated': {
                const t = msg.tournament ?? msg.state;
                if (!t) {
                    console.warn('localTournamentCreated without tournament/state:', msg);
                    break;
                }
                // Brief info, no technical id/status
                document.getElementById('tournament-info')!.textContent =
                    `Tournament created with ${t.participants.length} players.`;
                renderMatchesTable(t, currentMatchId);
                break;
            }
            case 'localTournamentUpdate': {
                const t = msg.tournament ?? msg.state;
                if (!t) {
                    console.warn('localTournamentUpdate without tournament/state:', msg);
                    break;
                }
                // Do not show detailed "t-local-X, status: active" text
                document.getElementById('tournament-info')!.textContent =
                    `Tournament in progress: ${t.participants.length} players.`;
                renderMatchesTable(t, currentMatchId);
                break;
            }
            case 'localMatchStart': {
                const p1 = msg.player1;
                const p2 = msg.player2;

                if (!p1 || !p2) {
                    console.error('localMatchStart: missing player1/player2 in message', msg);
                    return;
                }

                currentMatch = { p1, p2 };
                currentMatchId = msg.matchId || null;

                gameState = {
                    ball: { x: 50, y: 50, vx: 0, vy: 0 },
                    paddles: {
                        [p1.id]: 50,
                        [p2.id]: 50,
                    },
                    score: {
                        [p1.id]: 0,
                        [p2.id]: 0,
                    },
                    width: 100,
                    height: 100,
                    status: 'countdown',
                    playerNames: {
                        [p1.id]: p1.name,
                        [p2.id]: p2.name,
                    },
                };
                document.getElementById('pong')!.classList.remove('hidden');
                document.getElementById('status')!.innerHTML = /*html*/`
                    <div style="font-size: 24px; font-weight: bold; color: white; text-align: center; margin: 10px 0;">
                        ${p1.name} VS ${p2.name}
                    </div>
                `;
                break;
            }
            case 'countdown': {
                // countdown only inside canvas (via countdownValue)
                countdownValue = msg.value;
                break;
            }
            case 'start': {
                countdownValue = null;
                break;
            }
            case 'update': {
                gameState = msg.state;
                drawGame();
                break;
            }
            case 'end': {
                document.getElementById('pong')!.classList.add('hidden');
                document.getElementById('status')!.textContent =
                    `Match ended. Winner: ${msg.winner.name}`;
                currentMatch = null;
                currentMatchId = null;
                gameState = null;
                countdownValue = null;
                break;
            }
            case 'localTournamentEnd': {
                document.getElementById('status')!.innerHTML = /*html*/`
                    <span style="color: gold; font-weight: bold;">
                        🏆 Congratulations! ${msg.winner.name} is the champion! 🏆
                    </span>
                `;
                document.getElementById('pong')!.classList.add('hidden');
                break;
            }
            default: {
                console.warn('Unknown local tournament message type:', msg);
            }
        }
    }

    // --- Matches table renderer (simple view) ---

    function renderMatchesTable(state: any, highlightMatchId: string | null) {
        const container = document.getElementById('matches-table');
        if (!container) return;

        const participants: { id: string; name: string }[] = state.participants || [];
        const rounds: any[][] = state.rounds || [];

        if (!rounds.length) {
            container.innerHTML = '';
            return;
        }

        const lookupName = (id: string | undefined) => {
            if (!id) return 'TBD';
            const p = participants.find(p => p.id === id);
            return p ? p.name : 'TBD';
        };

        let html = `
            <div class="overflow-x-auto">
                <table class="min-w-full text-sm text-white border border-white/20 rounded">
                    <thead class="bg-white/10">
                        <tr>
                            <th class="px-2 py-1 text-left">Match</th>
                            <th class="px-2 py-1 text-left">Player 1</th>
                            <th class="px-2 py-1 text-left">Player 2</th>
                            <th class="px-2 py-1 text-left">Winner</th>
                            <th class="px-2 py-1 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        let matchCounter = 1;

        rounds.forEach((round) => {
            round.forEach((match) => {
                const p1Name = lookupName(match.p1);
                const p2Name = lookupName(match.p2);
                const winnerName = lookupName(match.winnerId);
                const status = match.status || 'unknown';

                const isCurrent = highlightMatchId && match.id === highlightMatchId;
                const rowClass = isCurrent ? 'bg-yellow-500/30' : '';

                html += `
                    <tr class="${rowClass}">
                        <td class="px-2 py-1 border-t border-white/10">#${matchCounter}</td>
                        <td class="px-2 py-1 border-t border-white/10">${p1Name}</td>
                        <td class="px-2 py-1 border-t border-white/10">${p2Name}</td>
                        <td class="px-2 py-1 border-t border-white/10">${winnerName !== 'TBD' ? winnerName : '—'}</td>
                        <td class="px-2 py-1 border-t border-white/10">${status}</td>
                    </tr>
                `;
                matchCounter++;
            });
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = html;
    }

    // --- Game drawing ---

    function drawGame() {
        if (!currentMatch || !gameState) return;

        const canvas = document.getElementById('pong') as HTMLCanvasElement | null;
        if (!canvas) {
            console.error('Pong canvas not found');
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Failed to get canvas context');
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const width = canvas.width;
        const height = canvas.height;
        const VIRTUAL_WIDTH = 100;
        const VIRTUAL_HEIGHT = 100;
        const PADDLE_HEIGHT = 20;
        const scaleX = width / VIRTUAL_WIDTH;
        const scaleY = height / VIRTUAL_HEIGHT;

        // Ball
        const ball = gameState.ball;
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(ball.x * scaleX, ball.y * scaleY, 5, 0, Math.PI * 2);
        ctx.fill();

        // Paddles
        const paddleHeight = PADDLE_HEIGHT * scaleY;
        const paddleWidth = 10;
        const ids = Object.keys(gameState.paddles || {});

        ids.forEach((id, index) => {
            const y = gameState.paddles[id] * scaleY;
            const x = index === 0 ? 0 : width - paddleWidth;
            ctx.fillStyle = index === 0 ? COLORS.squidGame.greenDark : COLORS.squidGame.pinkDark;
            ctx.fillRect(x, y, paddleWidth, paddleHeight);
        });

        // Names
        ctx.fillStyle = 'white';
        ctx.font = '16px sans-serif';
        const names = gameState.playerNames || {};
        const p1Name = names[currentMatch.p1.id] || currentMatch.p1.name;
        const p2Name = names[currentMatch.p2.id] || currentMatch.p2.name;
        ctx.fillText(p1Name, 20, 20);
        ctx.fillText(p2Name, width - ctx.measureText(p2Name).width - 20, 20);

        // Scores
        const p1Score = gameState.score?.[currentMatch.p1.id] || 0;
        const p2Score = gameState.score?.[currentMatch.p2.id] || 0;
        const scoreText = `${p1Score} - ${p2Score}`;
        ctx.font = '20px sans-serif';
        const scoreWidth = ctx.measureText(scoreText).width;
        ctx.fillText(scoreText, (width - scoreWidth) / 2, 25);

        // Countdown overlay (only here now)
        if (countdownValue !== null) {
            ctx.fillStyle = 'white';
            ctx.font = '64px sans-serif';
            const text = countdownValue.toString();
            const textWidth = ctx.measureText(text).width;
            ctx.fillText(text, (width - textWidth) / 2, height / 4);
        }
    }

    // ----- Keyboard handling for local -----

    let keys: { [key: string]: boolean } = {};
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
    });
    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    // OPTION 1: keep your original interval-based sending (active)
    function sendMoveIntervalBased() {
        if (!currentMatch) return;
        const socket = wsManager.localTournamentWS;
        if (!socket || socket.readyState !== WebSocket.OPEN) return;

        if (keys['ArrowUp']) {
            socket.send(JSON.stringify({ type: 'move', direction: 'up', playerId: currentMatch.p2.id }));
        }
        if (keys['ArrowDown']) {
            socket.send(JSON.stringify({ type: 'move', direction: 'down', playerId: currentMatch.p2.id }));
        }
        if (keys['w']) {
            socket.send(JSON.stringify({ type: 'move', direction: 'up', playerId: currentMatch.p1.id }));
        }
        if (keys['s']) {
            socket.send(JSON.stringify({ type: 'move', direction: 'down', playerId: currentMatch.p1.id }));
        }
    }
    setInterval(sendMoveIntervalBased, 50);

    // OPTION 2: event-driven sending
    /*
    function sendMoveOnKeyEvent(direction: 'up' | 'down', playerId: string) {
        const socket = wsManager.localTournamentWS;
        if (!currentMatch || !socket || socket.readyState !== WebSocket.OPEN) return;
        socket.send(JSON.stringify({ type: 'move', direction, playerId }));
    }

    document.addEventListener('keydown', (e) => {
        if (!currentMatch) return;
        if (e.key === 'ArrowUp') sendMoveOnKeyEvent('up', currentMatch.p2.id);
        if (e.key === 'ArrowDown') sendMoveOnKeyEvent('down', currentMatch.p2.id);
        if (e.key === 'w') sendMoveOnKeyEvent('up', currentMatch.p1.id);
        if (e.key === 's') sendMoveOnKeyEvent('down', currentMatch.p1.id);
    });
    */

    function drawLoop() {
        drawGame();
        requestAnimationFrame(drawLoop);
    }
    drawLoop();
}
