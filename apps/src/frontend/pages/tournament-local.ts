import { renderBackgroundFull } from '../utils/layout.js';
import { wsManager } from '../websocket/ws-manager.js';
import { COLORS } from '../constants/colors.js';
import { languageStore, transelate_per_id } from './languages.js';
import { translations_tournament_render } from './languages_i18n.js';
import { initGlobalLanguageSelector } from '../utils/globalLanguageSelector.js';

let currentMatch: any = null;
let currentMatchId: string | null = null;
let gameState: any = null;
let countdownValue: number | null = null;
let countdownStartTime: number | null = null;

export async function renderLocalTournament(root: HTMLElement) {
        initGlobalLanguageSelector();
    root.innerHTML = renderBackgroundFull(/*html*/`
    <div class="max-w-5xl mx-auto m-8 p-8 bg-gradient-to-br from-white/5 via-white/10 to-white/5 rounded-3xl shadow-2xl shadow-purple-500/10 backdrop-blur-xl border border-white/20">
        <!-- Header with gradient text -->
        <div class="mb-8">
            <h1 id="tournament_lobby_header" class="text-5xl md:text-6xl font-black mb-3 text-center bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent animate-[pulse_3s_ease-in-out_infinite]">
                ${translations_tournament_render[languageStore.language]!.tournament_lobby_header}
            </h1>
            <p id="glory_header" class="text-center text-gray-300 text-lg font-light tracking-wide">
                ${translations_tournament_render[languageStore.language]!.glory_header}
            </p>
        </div>

        <!-- Local only UI -->
        <div id="local-section">
            <!-- Tournament Size Selector Card -->
            <div class="mb-6 p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                <label id="tournament_size_label" class="block text-white text-lg font-semibold mb-3 flex items-center gap-2">
                    <span class="text-2xl">👥</span>
                    ${translations_tournament_render[languageStore.language].tournament_size}
                </label>
                <select id="local-size" class="w-full bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-white p-4 rounded-xl border border-white/20 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300 cursor-pointer text-lg font-medium backdrop-blur-sm hover:from-purple-600/40 hover:to-pink-600/40">
                    <option id="tournament_size_4" value="4" class="bg-gray-900">${translations_tournament_render[languageStore.language].player_championship}</option>
                    <option id="tournament_size_8" value="8" class="bg-gray-900">${translations_tournament_render[languageStore.language].elite_tournament}</option>
                </select>
            </div>

            <!-- Player Names Card -->
            <div class="mb-6 p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                <h3 id="player_names_header" class="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                    <span class="text-2xl">🎮</span>
                    ${translations_tournament_render[languageStore.language].player_names}
                </h3>
                <div id="name-inputs" class="space-y-3"></div>
            </div>

            <!-- Create Button -->
            <button id="create-local" class="group relative w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 hover:from-yellow-400 hover:via-orange-400 hover:to-yellow-400 text-black px-8 py-4 rounded-xl font-bold text-xl shadow-2xl shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden">
                <span class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                <span id="create_local_btn_text" class="relative flex items-center justify-center gap-3">
                    <span class="text-2xl"></span>
                    ${translations_tournament_render[languageStore.language].create_local_tournament}
                    <span class="text-2xl">🚀</span>
                </span>
            </button>
        </div>

        <!-- Tournament Active Section - Full Screen Layout -->
        <div id="local-tournament" class="hidden">
        </div>
    </div>
    
    <!-- Full Screen Game Layout (shown when tournament starts) -->
    <div id="tournament-game-view" class="hidden fixed inset-0 z-40 flex">
        <!-- LEFT SIDEBAR - Information Panel -->
        <div class="w-80 bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-xl border-r border-white/20 overflow-y-auto">
            <div class="p-6 space-y-4">
                <div id="tournament-info" class="text-white text-sm p-3 bg-white/10 rounded-lg border border-white/20"></div>
                <p id="status" class="text-gray-300 text-sm p-2 bg-white/5 rounded-lg">${translations_tournament_render[languageStore.language].waiting}</p>
                <div id="matches-table"></div>
                <button id="quit-local" class="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all hover:scale-105 active:scale-95">
                    <span id="quit_tournament_btn_text" class="flex items-center justify-center gap-2">
                        <span>❌</span>
                        ${translations_tournament_render[languageStore.language].quit_tournament}
                    </span>
                </button>
            </div>
        </div>

        <!-- RIGHT SIDE - Game Canvas (Full Remaining Space) -->
        <div class="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black p-8">
            <!-- Score Display Above Canvas -->
            <div class="flex items-center justify-between w-full max-w-5xl mb-6">
                <!-- Left Player -->
                <div class="flex flex-col items-center space-y-2 bg-gradient-to-br from-blue-600/20 to-blue-400/20 backdrop-blur-lg border border-blue-400/40 rounded-2xl px-8 py-6 shadow-2xl shadow-blue-500/30">
                    <div id="player1-name" class="text-3xl font-black text-blue-300 tracking-wide">Player 1</div>
                    <div id="player1-score" class="text-6xl font-black bg-gradient-to-b from-white to-blue-200 bg-clip-text text-transparent">0</div>
                </div>

                <!-- VS Text -->
                <div class="text-6xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent animate-pulse tracking-widest" style="font-family: 'Impact', 'Arial Black', sans-serif; text-shadow: 0 0 30px rgba(251, 191, 36, 0.5);">
                    VS
                </div>

                <!-- Right Player -->
                <div class="flex flex-col items-center space-y-2 bg-gradient-to-br from-orange-600/20 to-orange-400/20 backdrop-blur-lg border border-orange-400/40 rounded-2xl px-8 py-6 shadow-2xl shadow-orange-500/30">
                    <div id="player2-name" class="text-3xl font-black text-orange-300 tracking-wide">Player 2</div>
                    <div id="player2-score" class="text-6xl font-black bg-gradient-to-b from-white to-orange-200 bg-clip-text text-transparent">0</div>
                </div>
            </div>

            <!-- Canvas -->
            <canvas id="pong" width="1000" height="600" class="border-4 border-purple-500/50 bg-gradient-to-br from-black/60 to-purple-900/30 rounded-2xl shadow-2xl shadow-purple-500/30"></canvas>
        </div>
    </div>

    <!-- Champion Celebration Modal -->
    <div id="champion-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div class="relative bg-gradient-to-br from-yellow-900/95 to-orange-900/95 rounded-3xl shadow-2xl border-4 border-yellow-400/50 p-12 max-w-2xl w-full mx-4 animate-[scaleIn_0.5s_ease-out]">
            <!-- Trophy Icon -->
            <div class="text-center mb-6">
                <div class="text-9xl animate-bounce">🏆</div>
            </div>
            
            <!-- Congratulations Text -->
            <div class="text-center space-y-4 mb-8">
                <h2 class="text-5xl font-black bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 bg-clip-text text-transparent animate-pulse">
                    CONGRATULATIONS!
                </h2>
                <div id="champion-name" class="text-7xl font-black bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent py-4">
                    Champion
                </div>
                <p class="text-3xl font-bold text-yellow-300">
                    is the CHAMPION!
                </p>
            </div>

            <!-- Confetti Effect -->
            <div class="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                <div class="absolute top-0 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-[fall_3s_linear_infinite]"></div>
                <div class="absolute top-0 left-1/2 w-2 h-2 bg-orange-400 rounded-full animate-[fall_3.5s_linear_infinite_0.5s]"></div>
                <div class="absolute top-0 left-3/4 w-2 h-2 bg-red-400 rounded-full animate-[fall_4s_linear_infinite_1s]"></div>
            </div>

            <!-- Close Button -->
            <button id="close-champion-modal" class="w-full px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-black font-black text-2xl rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95">
                Continue
            </button>
        </div>
    </div>

    <style>
      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.5);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      @keyframes fall {
        0% {
          transform: translateY(-10px) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(500px) rotate(360deg);
          opacity: 0;
        }
      }
    </style>
    `);

    // --- Translations stay as before ---
    languageStore.subscribe((lang) => {
        transelate_per_id(translations_tournament_render, "tournament_lobby_header", lang, "tournament_lobby_header");
        transelate_per_id(translations_tournament_render, "glory_header", lang, "glory_header");
        transelate_per_id(translations_tournament_render, "empty_p_msg", lang, "empty-p-msg");
        transelate_per_id(translations_tournament_render, "create_four_header", lang, "create-tournament-4");
        transelate_per_id(translations_tournament_render, "create_eight_header", lang, "create-tournament-8");
        transelate_per_id(translations_tournament_render, "player_names", lang, "player_names_header");
        transelate_per_id(translations_tournament_render, "create_local_tournament", lang, "create_local_btn_text");
        transelate_per_id(translations_tournament_render, "quit_tournament", lang, "quit_tournament_btn_text");
        transelate_per_id(translations_tournament_render, "waiting", lang, "status");
        transelate_per_id(translations_tournament_render, "player_championship", lang, "tournament_size_4");
        transelate_per_id(translations_tournament_render, "elite_tournament", lang, "tournament_size_8");
        transelate_per_id(translations_tournament_render, "tournament_size", lang, "tournament_size_label");
        
        // Update player name inputs when language changes
        const sizeSelect = document.getElementById('local-size') as HTMLSelectElement;
        if (sizeSelect) {
            const currentSize = parseInt(sizeSelect.value);
            updateNameInputs(currentSize);
        }
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

    // Close champion modal
    document.getElementById('close-champion-modal')!.addEventListener('click', () => {
        document.getElementById('champion-modal')!.classList.add('hidden');
    });

    // Quit local tournament
    document.getElementById('quit-local')!.addEventListener('click', () => {
        try {
            wsManager.quitLocalTournament();
        } catch (err) {
            console.error('Error quitting local tournament:', err);
        }
        // Hide game view and show setup
        document.getElementById('tournament-game-view')!.classList.add('hidden');
        document.getElementById('local-section')!.classList.remove('hidden');
        // show glory header again when we go back to lobby
        const glory = document.getElementById('glory_header');
        if (glory) glory.classList.remove('hidden');
        
        // Show navbar when quitting tournament
        const navbar = document.getElementById('navbar');
        if (navbar) navbar.classList.remove('hidden');

        currentMatch = null;
        currentMatchId = null;
        gameState = null;
        countdownValue = null;
        countdownStartTime = null;
        const matchesTable = document.getElementById('matches-table');
        if (matchesTable) matchesTable.innerHTML = '';
    });

    function updateNameInputs(size: number) {
        const container = document.getElementById('name-inputs')!;
        container.innerHTML = '';
        const tr = translations_tournament_render[languageStore.language];
        for (let i = 0; i < size; i += 2) {
            const row = document.createElement('div');
            row.className = 'grid grid-cols-1 md:grid-cols-2 gap-4';
            for (let j = 0; j < 2 && i + j < size; j++) {
                const playerNum = i + j + 1;
                const div = document.createElement('div');
                div.className = 'flex-1';
                div.innerHTML = /*html*/`
                    <label class="block text-white font-medium mb-2 text-sm flex items-center gap-2">
                        <span class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-sm shadow-lg">${playerNum}</span>
                        ${tr.player} ${playerNum}
                    </label>
                    <input type="text" class="name-input bg-white/10 text-white p-3 rounded-lg w-full border border-white/20 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 focus:bg-white/15 transition-all duration-200 placeholder-gray-400 font-medium" placeholder="${tr.enter_player_name}">
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
        document.getElementById('tournament-game-view')!.classList.remove('hidden');
        // hide glory header after tournament starts
        const glory = document.getElementById('glory_header');
        if (glory) glory.classList.add('hidden');
        
        // Hide navbar when tournament is created
        const navbar = document.getElementById('navbar');
        if (navbar) navbar.classList.add('hidden');

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
                initGlobalLanguageSelector();
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
                initGlobalLanguageSelector();
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
                document.getElementById('status')!.innerHTML = /*html*/`
                    <div style="font-size: 18px; font-weight: bold; color: white; text-align: center;">
                        ${p1.name} VS ${p2.name}
                    </div>
                `;
                initGlobalLanguageSelector();
                break;
            }
            case 'countdown': {
                countdownValue = msg.value;
                countdownStartTime = performance.now();
                
                // Hide navbar when countdown starts
                const navbar = document.getElementById('navbar');
                if (navbar) navbar.classList.add('hidden');
                    initGlobalLanguageSelector();
                break;
            }
            case 'start': {
                countdownValue = null;
                countdownStartTime = null;
                
                // Keep navbar hidden during gameplay
                const navbar = document.getElementById('navbar');
                if (navbar) navbar.classList.add('hidden');
                break;
            }
            case 'update': {
                gameState = msg.state;
                drawGame();
                break;
            }
            case 'end': {
                document.getElementById('status')!.textContent =
                    `Match ended. Winner: ${msg.winner.name}`;
                currentMatch = null;
                currentMatchId = null;
                gameState = null;
                countdownValue = null;
                countdownStartTime = null;
                // Don't show navbar here - keep it hidden until tournament is quit
                initGlobalLanguageSelector();
                break;
            }
            case 'localTournamentEnd': {
                // Show champion modal with winner's name
                const championNameEl = document.getElementById('champion-name');
                const championModal = document.getElementById('champion-modal');
                if (championNameEl) championNameEl.textContent = msg.winner.name;
                if (championModal) championModal.classList.remove('hidden');
                
                // Also update status text
                document.getElementById('status')!.innerHTML = /*html*/`
                    <span style="color: gold; font-weight: bold;">
                        🏆 Congratulations! ${msg.winner.name} is the champion! 🏆
                    </span>
                `;
                initGlobalLanguageSelector();
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
            <div class="bg-white/5 rounded-lg border border-white/10 p-3">
                <h3 class="text-white text-sm font-bold mb-3 flex items-center gap-2">
                    ⚔️ Matches
                </h3>
                <div class="space-y-2">
        `;

        let matchCounter = 1;

        rounds.forEach((round) => {
            round.forEach((match) => {
                const p1Name = lookupName(match.p1);
                const p2Name = lookupName(match.p2);
                const winnerName = lookupName(match.winnerId);
                const status = match.status || 'unknown';

                const isCurrent = highlightMatchId && match.id === highlightMatchId;
                const bgClass = isCurrent ? 'bg-yellow-500/20 border-l-2 border-yellow-400' : 'bg-white/5';

                const statusIcon = status === 'completed' ? '✓' : status === 'in-progress' ? '⚡' : '○';
                const statusColor = status === 'completed' ? 'text-green-400' : status === 'in-progress' ? 'text-yellow-400' : 'text-gray-400';

                html += `
                    <div class="${bgClass} p-2 rounded text-xs">
                        <div class="flex items-center justify-between mb-1">
                            <span class="text-yellow-400 font-bold">#${matchCounter}</span>
                            <span class="${statusColor}">${statusIcon}</span>
                        </div>
                        <div class="text-white space-y-0.5">
                            <div class="${p1Name === winnerName && winnerName !== 'TBD' ? 'text-green-400 font-bold' : ''}">${p1Name}</div>
                            <div class="text-gray-500 text-center">vs</div>
                            <div class="${p2Name === winnerName && winnerName !== 'TBD' ? 'text-green-400 font-bold' : ''}">${p2Name}</div>
                        </div>
                        ${winnerName !== 'TBD' ? `<div class="text-green-400 text-xs mt-1">🏆 ${winnerName}</div>` : ''}
                    </div>
                `;
                matchCounter++;
            });
        });

        html += `
                </div>
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

        // ========== UPDATE HTML SCORE DISPLAYS ==========
        const names = gameState.playerNames || {};
        const p1Name = names[currentMatch.p1.id] || currentMatch.p1.name;
        const p2Name = names[currentMatch.p2.id] || currentMatch.p2.name;
        const p1Score = gameState.score?.[currentMatch.p1.id] || 0;
        const p2Score = gameState.score?.[currentMatch.p2.id] || 0;

        const player1NameEl = document.getElementById('player1-name');
        const player2NameEl = document.getElementById('player2-name');
        const player1ScoreEl = document.getElementById('player1-score');
        const player2ScoreEl = document.getElementById('player2-score');

        if (player1NameEl) player1NameEl.textContent = p1Name;
        if (player2NameEl) player2NameEl.textContent = p2Name;
        if (player1ScoreEl) player1ScoreEl.textContent = p1Score.toString();
        if (player2ScoreEl) player2ScoreEl.textContent = p2Score.toString();

        // ========== MODERN CLEAN BACKGROUND ==========
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

        // ========== MODERN CLEAN BALL ==========
        const ball = gameState.ball;
        const ballX = ball.x * scaleX;
        const ballY = ball.y * scaleY;
        const ballRadius = 10;

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
        const ids = Object.keys(gameState.paddles || {});

        ids.forEach((id, index) => {
            const paddleY = gameState.paddles[id] * scaleY;
            const paddleX = index === 0 ? 30 : width - paddleWidth - 30;
            
            // Use player colors
            const paddleColor = index === 0 ? '#6b9dff' : '#ff8b6b';
            const glowColor = index === 0 ? '#4a7dd9' : '#e56847';

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

        // Countdown overlay (only here now)
        if (countdownValue !== null) {
            const currentTime = performance.now();
            const elapsed = countdownStartTime ? (currentTime - countdownStartTime) / 1000 : 0;
            
            // Pulsing scale animation (grows and shrinks)
            const pulseFreq = 2; // 2 pulses per second
            const pulseScale = 1 + Math.sin(elapsed * pulseFreq * Math.PI * 2) * 0.15;
            
            // Pop-in animation when countdown changes
            const popScale = Math.min(1, elapsed * 4); // Quick pop-in over 0.25s
            const totalScale = pulseScale * popScale;
            
            // Gradient color based on countdown value
            const gradient = ctx.createLinearGradient(width / 2 - 100, height / 4 - 50, width / 2 + 100, height / 4 + 50);
            if (countdownValue === 3) {
                gradient.addColorStop(0, '#fbbf24'); // yellow-400
                gradient.addColorStop(1, '#f59e0b'); // yellow-600
            } else if (countdownValue === 2) {
                gradient.addColorStop(0, '#fb923c'); // orange-400
                gradient.addColorStop(1, '#f97316'); // orange-600
            } else {
                gradient.addColorStop(0, '#f87171'); // red-400
                gradient.addColorStop(1, '#ef4444'); // red-600
            }
            
            ctx.save();
            
            // Center point for scaling
            ctx.translate(width / 2, height / 4);
            ctx.scale(totalScale, totalScale);
            
            // Draw glow effect
            ctx.shadowColor = countdownValue === 1 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(251, 191, 36, 0.6)';
            ctx.shadowBlur = 40;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            
            // Draw text
            ctx.fillStyle = gradient;
            ctx.font = 'bold 96px sans-serif';
            const text = countdownValue.toString();
            const textWidth = ctx.measureText(text).width;
            ctx.fillText(text, -textWidth / 2, 32);
            
            // Draw outline for extra pop
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;
            ctx.strokeText(text, -textWidth / 2, 32);
            
            ctx.restore();
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

    // Horizontal pong - paddles move up/down
    function sendMoveIntervalBased() {
        const socket = wsManager.localTournamentWS;
        if (!currentMatch || !socket || socket.readyState !== WebSocket.OPEN) return;

        // Right paddle controlled by Arrow Up/Down keys
        if (keys['ArrowUp']) {
            socket.send(JSON.stringify({ type: 'move', direction: 'up', side: 'right' }));
        }
        if (keys['ArrowDown']) {
            socket.send(JSON.stringify({ type: 'move', direction: 'down', side: 'right' }));
        }

        // Left paddle controlled by W/S keys
        if (keys['w'] || keys['W']) {
            socket.send(JSON.stringify({ type: 'move', direction: 'up', side: 'left' }));
        }
        if (keys['s'] || keys['S']) {
            socket.send(JSON.stringify({ type: 'move', direction: 'down', side: 'left' }));
        }
    }
    setInterval(sendMoveIntervalBased, 50);

    function drawLoop() {
        drawGame();
        requestAnimationFrame(drawLoop);
    }
    drawLoop();
}
