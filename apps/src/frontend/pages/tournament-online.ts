import { renderBackgroundFull } from '../utils/layout.js';
import { getUser } from '../utils/auth.js';
import { wsManager } from '../websocket/ws-manager.js';
import { COLORS } from '../constants/colors.js';
import { languageStore, transelate_per_id } from './languages.js';
import { translations_tournament_render } from './languages_i18n.js';
import { showToast } from './listenerUpdatePasswordAndUsername.js';
import { initGlobalLanguageSelector } from '../utils/globalLanguageSelector.js';

let currentTournamentId: number | null = null;
let currentMatch: any = null;
let gameState: any = null;
let countdownValue: number | null = null;
let gameSocket: WebSocket | null = null;
let isPlayerInMatch = false;

// page cleanup between SPA navigations/rerenders
let cleanupOnlineTournamentPage: (() => void) | null = null;

// per-match controls cleanup (so it doesn’t stack between rounds)
let cleanupCurrentMatchControls: (() => void) | null = null;

export async function renderOnlineTournament(root: HTMLElement) {
    // cleanup previous instance
    cleanupOnlineTournamentPage?.();
    cleanupOnlineTournamentPage = null;

    root.innerHTML = renderBackgroundFull(/*html*/ `
    <div class="max-w-4xl mx-auto m-8 p-6 bg-white/10 rounded-xl shadow-lg backdrop-blur-md">
        <h1 id="tournament_lobby_header"class="text-3xl font-bold mb-4 text-center text-white">${translations_tournament_render[languageStore.language]!.tournament_lobby_header}</h1>
        <p id="glory_header"class="text-center text-gray-400 mb-6">${translations_tournament_render[languageStore.language]!.glory_header}</p>

        <div id="online-section">
            <div id="winner-announcement" class="hidden mb-4 p-4 bg-yellow-500/20 border border-yellow-400 rounded-lg text-center text-white"></div>
            <div id="tournament-list" class="space-y-4 text-white"></div>
        </div>

        <div id="online-tournament-match" class="hidden">
            <div id="online-countdown" class="text-6xl font-bold text-center text-white mb-6 hidden">5</div>
            <p id="online-status" class="text-center text-gray-400 mb-4">Match starting...</p>
            <canvas id="online-pong" width="600" height="400" class="mx-auto border border-white/30 bg-white/10 backdrop-blur-md rounded shadow-lg hidden"></canvas>
            <div class="text-center mt-6">
                <button id="quit-online-match" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">Quit Match</button>
            </div>
        </div>
    </div>
    `);

    languageStore.subscribe((lang) => {
        transelate_per_id(translations_tournament_render, 'tournament_lobby_header', lang, 'tournament_lobby_header');
        transelate_per_id(translations_tournament_render, 'glory_header', lang, 'glory_header');
        transelate_per_id(translations_tournament_render, 'empty_p_msg', lang, 'empty-p-msg');
        transelate_per_id(translations_tournament_render, 'create_four_header', lang, 'create-tournament-4');
        transelate_per_id(translations_tournament_render, 'create_eight_header', lang, 'create-tournament-8');
    });

    renderTournamentList();
    wsManager.subscribeToPresence(renderTournamentList);

    const user = getUser();
    const userId: number | undefined = user?.id;

    const enterLobbyView = () => {
        document.getElementById('online-tournament-match')!.classList.add('hidden');
        document.getElementById('online-section')!.classList.remove('hidden');
    };

    const enterMatchView = () => {
        document.getElementById('online-section')!.classList.add('hidden');
        document.getElementById('online-tournament-match')!.classList.remove('hidden');
    };

    const resetMatchUI = () => {
        countdownValue = null;
        gameState = null;

        const countdownEl = document.getElementById('online-countdown')!;
        const canvasEl = document.getElementById('online-pong')!;
        const statusEl = document.getElementById('online-status')!;

        countdownEl.classList.add('hidden');
        canvasEl.classList.add('hidden');
        statusEl.textContent = 'Match starting...';
    };

    // Quit online match
    document.getElementById('quit-online-match')!.addEventListener('click', () => {
        // Stop local controls immediately (socket persists)
        cleanupCurrentMatchControls?.();
        cleanupCurrentMatchControls = null;

        if (gameSocket) {
            try {
                gameSocket.send(
                    JSON.stringify({
                        type: 'quitMatch',
                        tournamentId: currentTournamentId,
                        matchId: currentMatch?.id
                    })
                );
            } catch {}
        }

        isPlayerInMatch = false;
        currentMatch = null;
        resetMatchUI();
        enterLobbyView();
    });

    function handleTournamentMessage(msg: any) {
        // Game frames arrive on same socket
        if (msg.type === 'countdown' ||
            msg.type === 'start' ||
            msg.type === 'update' ||
            msg.type === 'end' ||
            msg.type === 'disconnect'
        ) {
            handleGameMessage(msg);
            initGlobalLanguageSelector();
            return;
        }

        if (msg.type === 'onlineMatchStart') {
            const tryEnterMatch = () => {
              const liveUser = getUser();
              const uid = Number(liveUser?.id);
              const p1 = Number(msg.player1?.id);
              const p2 = Number(msg.player2?.id);

              console.log('[tournament-online] matchStart participants check', {
                uid, p1, p2, shouldEnter: p1 === uid || p2 === uid
            });

              if (!Number.isFinite(uid)) return false;

              if (p1 !== uid && p2 !== uid) return true; // user resolved but not participant

              // participant path
              cleanupCurrentMatchControls?.();
              cleanupCurrentMatchControls = null;

              currentTournamentId = msg.tournamentId;
              isPlayerInMatch = true;
              currentMatch = { id: msg.matchId, p1: msg.player1, p2: msg.player2 };

              gameSocket = wsManager.onlineTournamentWS;
              if (!gameSocket) {
                showToast('Tournament socket not available', 'error');
                return true;
              }

              resetMatchUI();
              enterMatchView();
              startOnlineTournamentMatchControls();
              return true;
            };

            // attempt now
            if (!tryEnterMatch()) {
              // one quick retry to handle auth timing
              setTimeout(() => {
                if (!tryEnterMatch()) {
                  showToast('User not resolved yet. Please refresh and re-join tournament.', 'error');
                }
              }, 250);
            }

            initGlobalLanguageSelector();
            return;
        }

        if (msg.type === 'onlineMatchForfeit') {
            // optional: show a message; backend already ends match and advances bracket
            // Keep minimal UI behavior: update status if we are in that match.
            if (currentMatch?.id === msg.matchId) {
                document.getElementById('online-status')!.textContent = 'Match ended by forfeit.';
            }
            return;
        }

        if (msg.type === 'onlineTournamentCancelled') {
            // Only active participants receive this (as requested)
            showToast('Tournament cancelled: not enough active players', 'error');
            currentTournamentId = null;

            // reset match state/UI
            cleanupCurrentMatchControls?.();
            cleanupCurrentMatchControls = null;
            isPlayerInMatch = false;
            currentMatch = null;
            resetMatchUI();
            enterLobbyView();

            wsManager.disconnectOnlineTournamentSocket();
            renderTournamentList();
            return;
        }

        if (msg.type === 'onlineTournamentEnd') {
            const uid = getUser()?.id;
            const isWinner = msg.winner.id === uid;
            const announcementEl = document.getElementById('winner-announcement')!;

            announcementEl.innerHTML = isWinner
                ? /*html*/ `
            <div style="color: gold; font-size: 32px; font-weight: bold; text-align: center; margin: 20px 0;">
            🏆 CONGRATULATIONS! You are the CHAMPION! 🏆
            </div>
            <div style="color: white; font-size: 18px; text-align: center;">
            You won the tournament!
            </div>
        `
                : /*html*/ `
            <div style="color: gold; font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0;">
            🏆 Tournament Complete! 🏆
            </div>
            <div style="color: white; font-size: 18px; text-align: center;">
            Winner: ${msg.winner.name}
            </div>
        `;

            announcementEl.classList.remove('hidden');

            // If player is currently in a match, show message and return to lobby view
            if (isPlayerInMatch) {
                document.getElementById('online-status')!.innerHTML = announcementEl.innerHTML;

                setTimeout(() => {
                    cleanupCurrentMatchControls?.();
                    cleanupCurrentMatchControls = null;

                    isPlayerInMatch = false;
                    currentMatch = null;
                    resetMatchUI();
                    enterLobbyView();
                }, 2500);
            }

            // Hide announcement after 7s and reset tournament state
            setTimeout(() => {
                announcementEl.classList.add('hidden');
                announcementEl.innerHTML = '';
                currentTournamentId = null;
                wsManager.disconnectOnlineTournamentSocket();
                renderTournamentList();
            }, 7000);

            initGlobalLanguageSelector();
            return;
        }
    }

    function renderTournamentList() {
        const list = document.getElementById('tournament-list');
        if (!list) return;
        list.innerHTML = '';

        const tournaments = wsManager.onlineTournaments;

        const user = getUser();
        if (!user) return;
        const userId = user.id;

        // Presence list can lag; keep it only for UI display, not for match logic.
        const userTournament = tournaments.find((t) => t.playerIds.includes(userId));

        currentTournamentId = userTournament ? userTournament.id : currentTournamentId;

        if (userTournament) {
            const infoBox = document.createElement('div');
            infoBox.innerHTML = /*html*/ `
        <div class="text-center text-green-400 mb-4">
            ✅ You have joined Tournament <strong>${userTournament.id}</strong> (${userTournament.joined}/${userTournament.size})
        </div>
        <div class="text-center mb-4">
            <button id="quit-tournament-btn" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
            Quit Tournament
            </button>
        </div>
        `;
            list.appendChild(infoBox);

            infoBox.querySelector('#quit-tournament-btn')?.addEventListener('click', () => {
                wsManager.quitOnlineTournament();
                currentTournamentId = null;
                showToast('You left the tournament.', 'error');
                wsManager.disconnectOnlineTournamentSocket();
                renderTournamentList();
            });
        }

        if (tournaments.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.id = 'empty-p-msg';
            emptyMsg.className = 'text-center text-gray-400';
            const text = translations_tournament_render[languageStore.language].empty_p_msg;
            if (text) emptyMsg.textContent = text;
            list.appendChild(emptyMsg);
        }

        for (const t of tournaments) {
            const isFull = t.joined >= t.size;
            const userInTournament = t.playerIds.includes(userId);

            const div = document.createElement('div');
            div.className = 'border border-white/20 p-4 rounded-lg bg-black/30 flex justify-between items-center';

            div.innerHTML = `
        <div>
            <h2 class="font-semibold text-lg">Tournament ${t.id}</h2>
            <p class="text-sm text-gray-300">Host: ${t.hostId}</p>
            <p class="text-sm text-gray-300">${t.joined}/${t.size} players joined</p>
        </div>
        <button
            ${isFull || userTournament ? 'disabled' : ''}
            class="px-4 py-2 rounded bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium"
            data-id="${t.id}"
            data-size="${t.size}"
        >
            ${userInTournament ? 'Joined' : isFull ? 'Full' : 'Join'}
        </button>
        `;

            const button = div.querySelector('button')!;
            if (!isFull && !userTournament && !userInTournament) {
                button.addEventListener('click', () => {
                    joinTournament(t.id, t.size);
                });
            }

            list.appendChild(div);
        }

        const createDiv = document.createElement('div');
        createDiv.className = 'text-center mt-6';

        createDiv.innerHTML = /*html*/ `
        <button class="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold"
        id="create-tournament-4" ${userTournament ? 'disabled' : ''}>
        ${translations_tournament_render[languageStore.language]!.create_four_header}
        </button>
        <button class="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold ml-4"
        id="create-tournament-8" ${userTournament ? 'disabled' : ''}>
        ${translations_tournament_render[languageStore.language]!.create_eight_header}
        </button>
    `;

        createDiv.querySelector('#create-tournament-4')?.addEventListener('click', () => {
            if (!userTournament) createTournament(4);
        });

        createDiv.querySelector('#create-tournament-8')?.addEventListener('click', () => {
            if (!userTournament) createTournament(8);
        });

        list.appendChild(createDiv);
    }

    function joinTournament(id: number, size: 4 | 8) {
        if (currentTournamentId) {
            showToast(`⚠️ You're already in ONLINE Tournament ${currentTournamentId}.`, 'error');
            return;
        }

        const socket = wsManager.connectOnlineTournamentSocket('join', size, id, (msg) => {
            // Keep this callback minimal: rely on the subscribed handler for everything.
            if (msg.type === 'onlineTournamentJoined') {
                currentTournamentId = msg.id;
                showToast('Joined ONLINE tournament. Waiting for match...');
                renderTournamentList();
            }
        });

        if (!socket) showToast('Connection failed', 'error');
    }

    function createTournament(size: 4 | 8) {
        if (currentTournamentId) {
            showToast(`⚠️ You're already in a tournament.`, 'error');
            return;
        }

        const socket = wsManager.connectOnlineTournamentSocket('create', size, undefined, (msg) => {
            // Keep this callback minimal: rely on the subscribed handler for everything.
            if (msg.type === 'onlineTournamentJoined') {
                currentTournamentId = msg.id;
                showToast(`Created ONLINE Tournament ${msg.id}`);
                renderTournamentList();
            }
        });

        if (!socket) showToast('Failed to create tournament', 'error');
    }

    function startOnlineTournamentMatchControls() {
        // Attach controls only; view/state handled elsewhere
        const heldKeys: Record<string, boolean> = {};
        const keydownHandler = (e: KeyboardEvent) => {
            heldKeys[e.key] = true;
        };
        const keyupHandler = (e: KeyboardEvent) => {
            heldKeys[e.key] = false;
        };

        document.addEventListener('keydown', keydownHandler);
        document.addEventListener('keyup', keyupHandler);

        const sendMove = () => {
            if (!gameSocket || gameSocket.readyState !== WebSocket.OPEN) return;
            if (heldKeys['ArrowUp']) gameSocket.send(JSON.stringify({ type: 'move', direction: 'up' }));
            if (heldKeys['ArrowDown']) gameSocket.send(JSON.stringify({ type: 'move', direction: 'down' }));
        };

        const moveInterval = setInterval(sendMove, 50);

        cleanupCurrentMatchControls = () => {
            document.removeEventListener('keydown', keydownHandler);
            document.removeEventListener('keyup', keyupHandler);
            clearInterval(moveInterval);
        };
    }

    function handleGameMessage(gameMsg: any) {
        switch (gameMsg.type) {
            case 'countdown':
                // countdownValue = Number(gameMsg.value);
                document.getElementById('online-countdown')!.classList.remove('hidden');
                document.getElementById('online-countdown')!.textContent = gameMsg.value;
                if (gameMsg.value === 0) {
                    document.getElementById('online-countdown')!.classList.add('hidden');
                    document.getElementById('online-pong')!.classList.remove('hidden');
                }
                break;

            case 'start':
                document.getElementById('online-countdown')!.classList.add('hidden');
                document.getElementById('online-pong')!.classList.remove('hidden');
                if (currentMatch) {
                    document.getElementById('online-status')!.innerHTML = /*html*/ `<div style="font-size: 24px; font-weight: bold; color: white; text-align: center; margin: 10px 0;">${currentMatch.p1.name || currentMatch.p1.id} VS ${currentMatch.p2.name || currentMatch.p2.id}</div>`;
                }
                break;

            case 'update':
                gameState = gameMsg.state;
                if (document.getElementById('online-pong')!.classList.contains('hidden')) {
                    document.getElementById('online-pong')!.classList.remove('hidden');
                }
                if (gameState?.playerNames && currentMatch) {
                    const p1Name = gameState.playerNames[currentMatch.p1.id] || currentMatch.p1.name || currentMatch.p1.id;
                    const p2Name = gameState.playerNames[currentMatch.p2.id] || currentMatch.p2.name || currentMatch.p2.id;
                    document.getElementById('online-status')!.innerHTML = /*html*/ `<div style="font-size: 24px; font-weight: bold; color: white; text-align: center; margin: 10px 0;">${p1Name} VS ${p2Name}</div>`;
                }
                break;

            case 'end':
                console.log('[tournament-online] match end', { matchId: currentMatch?.id });

                // cleanup
                cleanupCurrentMatchControls?.();
                cleanupCurrentMatchControls = null;

                document.getElementById('online-pong')!.classList.add('hidden');
                document.getElementById('online-status')!.textContent = `Match ended. Winner: ${gameMsg.winner.name}`;

                // return to lobby UI; next round will come via onlineMatchStart
                setTimeout(() => {
                    isPlayerInMatch = false;
                    currentMatch = null;
                    resetMatchUI();
                    enterLobbyView();
                }, 1200);
                break;

            case 'disconnect':
                // cleanup
                cleanupCurrentMatchControls?.();
                cleanupCurrentMatchControls = null;

                showToast('Opponent disconnected', 'error');

                isPlayerInMatch = false;
                currentMatch = null;
                resetMatchUI();
                enterLobbyView();
                break;
        }
    }

    // ----- single RAF loop per page instance -----
    let rafId: number | null = null;
    const drawLoop = () => {
        if (isPlayerInMatch) drawOnlineGame();
        rafId = requestAnimationFrame(drawLoop);
    };
    drawLoop();

    // subscribe current page instance
    wsManager.subscribeToOnlineTournament(handleTournamentMessage);

    // cleanup for next render/navigation
    cleanupOnlineTournamentPage = () => {
        cleanupCurrentMatchControls?.();
        cleanupCurrentMatchControls = null;

        if (rafId !== null) cancelAnimationFrame(rafId);
        wsManager.unsubscribeFromOnlineTournament(handleTournamentMessage);

        // IMPORTANT: remove presence listener to avoid stacking across renders
        // wsManager.unsubscribeFromPresence(renderTournamentList);
    };

    function drawOnlineGame() {
        if (!currentMatch) return;
        if (!gameState) return;

        const canvas = document.getElementById('online-pong') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const width = canvas.width;
        const height = canvas.height;
        const VIRTUAL_WIDTH = 100;
        const VIRTUAL_HEIGHT = 100;
        const PADDLE_HEIGHT = 20;
        const scaleX = width / VIRTUAL_WIDTH;
        const scaleY = height / VIRTUAL_HEIGHT;

        // Draw ball
        const ball = gameState.ball;
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(ball.x * scaleX, ball.y * scaleY, 5, 0, Math.PI * 2);
        ctx.fill();

        // Draw paddles
        const paddleHeight = PADDLE_HEIGHT * scaleY;
        const paddleWidth = 10;
        const ids = Object.keys(gameState.paddles);

        const user = getUser();
        const userId = user?.id;

        ids.forEach((id, index) => {
            const y = gameState.paddles[id] * scaleY;
            const x = index === 0 ? 0 : width - paddleWidth;
            const isCurrentPlayer = Number(id) === userId;
            ctx.fillStyle = isCurrentPlayer ? COLORS.squidGame.greenDark : COLORS.squidGame.pinkDark;
            ctx.fillRect(x, y, paddleWidth, paddleHeight);
        });

        // Names
        ctx.fillStyle = 'white';
        ctx.font = '16px sans-serif';
        const names = gameState.playerNames || {};
        const p1Name = names[currentMatch.p1.id] || currentMatch.p1.name || currentMatch.p1.id;
        const p2Name = names[currentMatch.p2.id] || currentMatch.p2.name || currentMatch.p2.id;
        ctx.fillText(p1Name, 20, 20);
        ctx.fillText(p2Name, width - ctx.measureText(p2Name).width - 20, 20);

        // Scores
        const p1Score = gameState.score[currentMatch.p1.id] || 0;
        const p2Score = gameState.score[currentMatch.p2.id] || 0;
        const scoreText = `${p1Score} - ${p2Score}`;
        ctx.font = '20px sans-serif';
        const scoreWidth = ctx.measureText(scoreText).width;
        ctx.fillText(scoreText, (width - scoreWidth) / 2, 25);

        // Countdown
        if (countdownValue !== null) {
            ctx.fillStyle = 'white';
            ctx.font = '64px sans-serif';
            const text = countdownValue.toString();
            const textWidth = ctx.measureText(text).width;
            ctx.fillText(text, (width - textWidth) / 2, height / 4);
        }
    }
}
