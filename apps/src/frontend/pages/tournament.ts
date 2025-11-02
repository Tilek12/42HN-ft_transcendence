import { renderNav } from './nav';
import { renderBackgroundTop } from '../utils/layout';
import { getToken, validateLogin } from '../utils/auth';
import { wsManager } from '../websocket/ws-manager';
import { COLORS } from '../constants/colors';
import {languageStore, translations_tournament_render, transelate_per_id} from './languages';
import type {Language} from './languages';



let currentTournamentId: string | null = null;
let isLocalTournament = false;
let currentMatch: any = null;
let gameState: any = null;
let tournamentState: any = null;
let countdownValue: number | null = null;
let gameSocket: WebSocket | null = null;
let isPlayerInMatch = false;


export async function renderTournament(root: HTMLElement) {

  root.innerHTML = renderBackgroundTop(`
    <div class="max-w-4xl mx-auto mt-20 p-6 bg-white/10 rounded-xl shadow-lg backdrop-blur-md">
      <h1 id="tournament_lobby_header"class="text-3xl font-bold mb-4 text-center text-white">${translations_tournament_render[languageStore.language]!.tournament_lobby_header}</h1>
      <p id="glory_header"class="text-center text-gray-400 mb-6">${translations_tournament_render[languageStore.language]!.glory_header}</p>
      <div id="tournament-mode" class="mb-6 flex justify-center">
        <div class="bg-white/20 rounded-lg p-1 flex">
          <button id="online-btn" class="px-6 py-3 rounded-md text-white font-semibold transition-colors bg-blue-600 hover:bg-blue-700">🌐 Online</button>
          <button id="local-btn" class="px-6 py-3 rounded-md text-white font-semibold transition-colors bg-gray-600 hover:bg-gray-700">🏠 Local</button>
        </div>
      </div>
      <div id="online-section">
        <div id="winner-announcement" class="hidden mb-4 p-4 bg-yellow-500/20 border border-yellow-400 rounded-lg text-center text-white"></div>
        <div id="tournament-list" class="space-y-4 text-white"></div>
      </div>
      <div id="local-section" class="hidden">
        <div class="mb-4">
          <label class="block text-white mb-2">Tournament Size:</label>
          <select id="local-size" class="bg-white/20 text-white p-2 rounded">
            <option value="4">4 Players</option>
            <option value="8">8 Players</option>
          </select>
        </div>
        <div id="name-inputs" class="space-y-2"></div>
        <button id="create-local" class="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold mt-4">Create Local Tournament</button>
      </div>
      <div id="local-tournament" class="hidden">
        <div id="tournament-info" class="text-center text-gray-400 mb-6"></div>
        <div id="bracket" class="mb-6"></div>
        <div id="countdown" class="text-6xl font-bold text-center text-white mb-6 hidden">5</div>
        <p id="status" class="text-center text-gray-400 mb-4">Waiting for tournament to start...</p>
        <canvas id="pong" width="600" height="400" class="mx-auto border border-white/30 bg-white/10 backdrop-blur-md rounded shadow-lg hidden"></canvas>
        <div class="text-center mt-6">
          <button id="quit-local" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">Quit Tournament</button>
        </div>
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
    transelate_per_id(translations_tournament_render, "tournament_lobby_header", lang, "tournament_lobby_header");
    transelate_per_id(translations_tournament_render, "glory_header", lang, "glory_header");
    transelate_per_id(translations_tournament_render, "empty_p_msg", lang, "empty-p-msg");
    transelate_per_id(translations_tournament_render, "create_four_header", lang, "create-tournament-4");
    transelate_per_id(translations_tournament_render, "create_eight_header", lang, "create-tournament-8");
  })
  renderTournamentList();
  wsManager.subscribeToPresence(renderTournamentList);

  // Mode switch
  const onlineBtn = document.getElementById('online-btn')!;
  const localBtn = document.getElementById('local-btn')!;

  function setMode(mode: 'online' | 'local') {
    if (mode === 'online') {
      onlineBtn.classList.remove('bg-gray-600', 'hover:bg-gray-700');
      onlineBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
      localBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
      localBtn.classList.add('bg-gray-600', 'hover:bg-gray-700');
    } else {
      localBtn.classList.remove('bg-gray-600', 'hover:bg-gray-700');
      localBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
      onlineBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
      onlineBtn.classList.add('bg-gray-600', 'hover:bg-gray-700');
    }
    document.getElementById('online-section')!.classList.toggle('hidden', mode !== 'online');
    document.getElementById('local-section')!.classList.toggle('hidden', mode !== 'local');
    document.getElementById('local-tournament')!.classList.add('hidden');
    if (mode === 'local') {
      updateNameInputs(4);
    }
  }

  onlineBtn.addEventListener('click', () => setMode('online'));
  localBtn.addEventListener('click', () => setMode('local'));

  // Default to online
  setMode('online');

  // Size change
  document.getElementById('local-size')!.addEventListener('change', (e) => {
    const size = parseInt((e.target as HTMLSelectElement).value);
    updateNameInputs(size);
  });

  // Create local
  document.getElementById('create-local')!.addEventListener('click', () => createLocalTournament());

  // Quit local
  document.getElementById('quit-local')!.addEventListener('click', () => {
    wsManager.quitTournament();
    document.getElementById('local-tournament')!.classList.add('hidden');
    document.getElementById('local-section')!.classList.remove('hidden');
  });

  // Quit online match
  document.getElementById('quit-online-match')!.addEventListener('click', () => {
    if (gameSocket) {
      gameSocket.send(JSON.stringify({ type: 'quit' }));
      gameSocket.close();
      gameSocket = null;
    }
    document.getElementById('online-tournament-match')!.classList.add('hidden');
    document.getElementById('tournament-mode')!.classList.remove('hidden');
    isPlayerInMatch = false;
    currentMatch = null;
    gameState = null;
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
        div.innerHTML = `
          <label class="block text-white mb-2">Player ${playerNum}:</label>
          <input type="text" class="name-input bg-white/20 text-white p-2 rounded w-full" placeholder="Name">
        `;
        row.appendChild(div);
      }
      container.appendChild(row);
    }
  }

  function createLocalTournament() {
    const size = parseInt((document.getElementById('local-size') as HTMLSelectElement).value);
    const names: string[] = [];
    document.querySelectorAll('.name-input').forEach(input => {
      const name = (input as HTMLInputElement).value.trim();
      if (!name) {
        alert('All names must be filled');
        return;
      }
      names.push(name);
    });
    if (names.length !== size) return;

    const socket = wsManager.connectTournamentSocket('create', size, undefined, (msg) => {
      handleTournamentMessage(msg);
    }, 'local', names);

    if (!socket) {
      alert('Failed to create tournament');
      return;
    }

    isLocalTournament = true;
    document.getElementById('local-section')!.classList.add('hidden');
    document.getElementById('local-tournament')!.classList.remove('hidden');
  }

  function handleTournamentMessage(msg: any) {
    if (isLocalTournament) {
      handleLocalMessage(msg);
      return;
    }

    if (msg.type === 'matchStart') {
      const token = getToken();
      const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;

      if (msg.player1 === userId || msg.player2 === userId) {
        // 🎯 Player is part of this match – handle on tournament page
        isPlayerInMatch = true;
        // Get player names from tournament participants
        const tournament = wsManager.onlineTournaments.find(t => t.id === msg.tournamentId);
        const p1Name = tournament?.playerIds.includes(msg.player1) ? 'Player 1' : msg.player1; // fallback
        const p2Name = tournament?.playerIds.includes(msg.player2) ? 'Player 2' : msg.player2; // fallback
        currentMatch = {
          p1: { id: msg.player1, name: p1Name },
          p2: { id: msg.player2, name: p2Name }
        };
        // Create game socket first, then signal readiness
        gameSocket = wsManager.createGameSocket('tournament', msg.size, msg.tournamentId);
        if (!gameSocket) {
          alert('Failed to create game socket for tournament match');
          return;
        }

        // Signal that our game socket is ready
        wsManager.tournamentWS?.send(JSON.stringify({
          type: 'playerReady',
          tournamentId: msg.tournamentId,
          matchId: msg.matchId
        }));

        startOnlineTournamentMatch(msg);
      } else {
        console.log('🎯 Spectating match in tournament bracket');
        // Optionally update bracket display live here
      }
    } else if (msg.type === 'tournamentEnd') {
      // Show winner announcement in tournament lobby for all players
      const token = getToken();
      const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;
      const isWinner = msg.winner.id === userId;

      const announcementEl = document.getElementById('winner-announcement')!;

      if (isWinner) {
        // Winner gets special celebration
        announcementEl.innerHTML = `
          <div style="color: gold; font-size: 32px; font-weight: bold; text-align: center; margin: 20px 0;">
            🏆 CONGRATULATIONS! You are the CHAMPION! 🏆
          </div>
          <div style="color: white; font-size: 18px; text-align: center;">
            You won the tournament! 🎉
          </div>
        `;
      } else {
        // Show who won for other players
        announcementEl.innerHTML = `
          <div style="color: gold; font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0;">
            🏆 Tournament Complete! 🏆
          </div>
          <div style="color: white; font-size: 18px; text-align: center;">
            Winner: ${msg.winner.name}
          </div>
        `;
      }

      announcementEl.classList.remove('hidden');

      // If player is currently in a match, also show on match screen and return to lobby
      if (isPlayerInMatch) {
        document.getElementById('online-status')!.innerHTML = announcementEl.innerHTML;

        // Return to tournament lobby after showing winner
        setTimeout(() => {
          document.getElementById('online-tournament-match')!.classList.add('hidden');
          document.getElementById('tournament-mode')!.classList.remove('hidden');
          isPlayerInMatch = false;
          currentMatch = null;
          gameState = null;
          if (gameSocket) {
            gameSocket.close();
            gameSocket = null;
          }
        }, 7000); // Show winner for 7 seconds
      }

      // Hide announcement after 7 seconds and reset tournament state
      setTimeout(() => {
        announcementEl.classList.add('hidden');
        announcementEl.innerHTML = '';
        // Reset tournament state
        currentTournamentId = null;
        wsManager.disconnectTournamentSocket();
        renderTournamentList();
      }, 7000); // Show winner for 7 seconds
    }
  }

  function renderTournamentList() {
    const list = document.getElementById('tournament-list')!;
    list.innerHTML = '';

    const tournaments = wsManager.onlineTournaments;
    const token = getToken();
    const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;

    const userTournament = tournaments.find(t => t.playerIds.includes(userId));
    currentTournamentId = userTournament ? userTournament.id : null;

    if (userTournament) {
      const infoBox = document.createElement('div');
      infoBox.innerHTML = `
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
        wsManager.quitTournament();
        currentTournamentId = null;
        alert('🚪 You left the tournament.');
        wsManager.disconnectTournamentSocket();
        renderTournamentList();
      });
    }

    if (tournaments.length === 0) {
      const emptyMsg = document.createElement('p');
      emptyMsg.id = "empty-p-msg";
      emptyMsg.className = 'text-center text-gray-400';
      emptyMsg.textContent = translations_tournament_render[languageStore.language]!.empty_p_msg;
      list.appendChild(emptyMsg);
    }

    for (const t of tournaments) {
      const isFull = t.joined >= t.size;
      const userInTournament = t.playerIds.includes(userId);

      const div = document.createElement('div');
      div.className =
        'border border-white/20 p-4 rounded-lg bg-black/30 flex justify-between items-center';

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

    createDiv.innerHTML = `
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

  function joinTournament(id: string, size: 4 | 8) {
    if (currentTournamentId) {
      alert(`⚠️ You're already in Tournament ${currentTournamentId}.`);
      return;
    }

    const socket = wsManager.connectTournamentSocket('join', size, id, (msg) => {
      handleTournamentMessage(msg);
      if (msg.type === 'tournamentJoined') {
        currentTournamentId = msg.id;
        alert('🎮 Joined tournament. Waiting for match...');
        renderTournamentList();
      } else if (msg.type === 'tournamentLeft') {
        currentTournamentId = null;
        renderTournamentList();
      } else if (msg.type === 'end') {
        alert(`🏁 Tournament finished! Winner: ${msg.winner}`);
        currentTournamentId = null;
        wsManager.disconnectTournamentSocket();
        renderTournamentList();
      }
    });

    if (!socket) alert('Connection failed');
  }

  function createTournament(size: 4 | 8) {
    if (currentTournamentId) {
      alert(`⚠️ You're already in a tournament.`);
      return;
    }

    const socket = wsManager.connectTournamentSocket('create', size, undefined, (msg) => {
      handleTournamentMessage(msg);
      if (msg.type === 'tournamentJoined') {
        currentTournamentId = msg.id;
        alert(`🎉 Created Tournament ${msg.id}`);
        renderTournamentList();
      } else if (msg.type === 'end') {
        alert(`🏁 Tournament finished! Winner: ${msg.winner}`);
        currentTournamentId = null;
        wsManager.disconnectTournamentSocket();
        renderTournamentList();
      }
    });

    if (!socket) alert('Failed to create tournament');
  }

  function handleLocalMessage(msg: any) {
    console.log('Local tournament message:', msg);
    if (msg.type === 'tournamentCreated') {
      tournamentState = msg.tournament;
      document.getElementById('tournament-info')!.textContent = `Tournament ${tournamentState.id} created with ${tournamentState.participants.length} players`;
      renderBracket();
    } else if (msg.type === 'tournamentUpdate') {
      tournamentState = msg.tournament;
      renderBracket();
    } else if (msg.type === 'matchStart') {
      currentMatch = { p1: msg.p1, p2: msg.p2 };
      // Initialize game state for countdown
      gameState = {
        ball: { x: 50, y: 50, vx: 0, vy: 0 },
        paddles: {
          [currentMatch.p1.id]: 50,
          [currentMatch.p2.id]: 50
        },
        score: {
          [currentMatch.p1.id]: 0,
          [currentMatch.p2.id]: 0
        },
        width: 100,
        height: 100,
        status: 'countdown',
        playerNames: {
          [currentMatch.p1.id]: currentMatch.p1.name,
          [currentMatch.p2.id]: currentMatch.p2.name
        }
      };
      document.getElementById('pong')!.classList.remove('hidden');
      document.getElementById('status')!.innerHTML = `<div style="font-size: 24px; font-weight: bold; color: white; text-align: center; margin: 10px 0;">${currentMatch.p1.name} VS ${currentMatch.p2.name}</div>`;
    } else if (msg.type === 'countdown') {
      countdownValue = msg.value;
    } else if (msg.type === 'start') {
      countdownValue = null;
    } else if (msg.type === 'update') {
      gameState = msg.state;
      drawGame();
    } else if (msg.type === 'end') {
      document.getElementById('pong')!.classList.add('hidden');
      document.getElementById('status')!.textContent = `Match ended. Winner: ${msg.winner.name}`;
      currentMatch = null;
      gameState = null;
    } else if (msg.type === 'tournamentEnd') {
      document.getElementById('status')!.innerHTML = `<span style="color: gold; font-weight: bold;">🏆 Congratulations! ${msg.winner.name} is the champion! 🏆</span>`;
      document.getElementById('pong')!.classList.add('hidden');
    }
  }

  function startOnlineTournamentMatch(msg: any) {
    // Hide tournament lobby, show match area
    document.getElementById('tournament-mode')!.classList.add('hidden');
    document.getElementById('online-section')!.classList.add('hidden');
    document.getElementById('online-tournament-match')!.classList.remove('hidden');

    // Clear any previous match status messages
    document.getElementById('online-status')!.textContent = 'Waiting for both players to be ready...';

    gameSocket.onmessage = (event) => {
      if (event.data === 'ping') {
        gameSocket?.send('pong');
        return;
      }

      let gameMsg: any;
      try {
        gameMsg = JSON.parse(event.data);
      } catch {
        console.warn('Invalid game message:', event.data);
        return;
      }

      switch (gameMsg.type) {
        case 'countdown':
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
          // Show player matchup like local tournaments
          if (currentMatch) {
            document.getElementById('online-status')!.innerHTML = `<div style="font-size: 24px; font-weight: bold; color: white; text-align: center; margin: 10px 0;">${currentMatch.p1.name || currentMatch.p1.id} VS ${currentMatch.p2.name || currentMatch.p2.id}</div>`;
          }
          break;

        case 'update':
          gameState = gameMsg.state;
          if (document.getElementById('online-pong')!.classList.contains('hidden')) {
            document.getElementById('online-pong')!.classList.remove('hidden');
          }
          // Update status with real player names when game state is received
          if (gameState?.playerNames && currentMatch) {
            const p1Name = gameState.playerNames[currentMatch.p1.id] || currentMatch.p1.name || currentMatch.p1.id;
            const p2Name = gameState.playerNames[currentMatch.p2.id] || currentMatch.p2.name || currentMatch.p2.id;
            document.getElementById('online-status')!.innerHTML = `<div style="font-size: 24px; font-weight: bold; color: white; text-align: center; margin: 10px 0;">${p1Name} VS ${p2Name}</div>`;
          }
          drawOnlineGame();
          break;

        case 'end':
          document.getElementById('online-pong')!.classList.add('hidden');
          document.getElementById('online-status')!.textContent = `Match ended. Winner: ${gameMsg.winner.name}`;
          // Return to tournament view after a delay
          setTimeout(() => {
            document.getElementById('online-tournament-match')!.classList.add('hidden');
            document.getElementById('tournament-mode')!.classList.remove('hidden');
            isPlayerInMatch = false;
            currentMatch = null;
            gameState = null;
            if (gameSocket) {
              gameSocket.close();
              gameSocket = null;
            }
          }, 3000);
          break;

        case 'disconnect':
          alert('Opponent disconnected');
          document.getElementById('online-tournament-match')!.classList.add('hidden');
          document.getElementById('tournament-mode')!.classList.remove('hidden');
          isPlayerInMatch = false;
          currentMatch = null;
          gameState = null;
          if (gameSocket) {
            gameSocket.close();
            gameSocket = null;
          }
          break;
      }
    };

    gameSocket.onerror = () => {
      alert('Game socket error');
      document.getElementById('online-tournament-match')!.classList.add('hidden');
      document.getElementById('tournament-mode')!.classList.remove('hidden');
      isPlayerInMatch = false;
    };

    // Set up keyboard controls
    const heldKeys: Record<string, boolean> = {};
    document.addEventListener('keydown', (e) => {
      heldKeys[e.key] = true;
    });
    document.addEventListener('keyup', (e) => {
      heldKeys[e.key] = false;
    });

    const sendMove = () => {
      if (!gameSocket || gameSocket.readyState !== WebSocket.OPEN) return;
      if (heldKeys['ArrowUp']) gameSocket.send(JSON.stringify({ type: 'move', direction: 'up' }));
      if (heldKeys['ArrowDown']) gameSocket.send(JSON.stringify({ type: 'move', direction: 'down' }));
    };

    setInterval(sendMove, 50);
  }

  function renderBracket() {
    if (!tournamentState) return;
    const bracketEl = document.getElementById('bracket')!;
    bracketEl.innerHTML = '';
    const rounds = tournamentState.rounds;
    for (let r = 0; r < rounds.length; r++) {
      const roundDiv = document.createElement('div');
      roundDiv.className = 'inline-block mx-4';
      roundDiv.innerHTML = `<h3 class="text-white text-center mb-2">Round ${r + 1}</h3>`;
      for (const match of rounds[r]) {
        const matchDiv = document.createElement('div');
        matchDiv.className = 'bg-white/20 p-2 rounded mb-2 text-white text-center';
        matchDiv.innerHTML = `
          <div>${match.p1.name} vs ${match.p2.name}</div>
          <div class="text-sm text-gray-400">${match.status}</div>
          ${match.winnerId ? `<div class="text-yellow-400">Winner: ${match.winnerId === match.p1.id ? match.p1.name : match.p2.name}</div>` : ''}
        `;
        roundDiv.appendChild(matchDiv);
      }
      bracketEl.appendChild(roundDiv);
    }
  }

  function drawGame() {
    if (!currentMatch) return;
    if (!gameState) return;
    const canvas = document.getElementById('pong') as HTMLCanvasElement;
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

    ids.forEach((id, index) => {
      const y = gameState.paddles[id] * scaleY;
      const x = index === 0 ? 0 : width - paddleWidth;
      ctx.fillStyle = index === 0 ? COLORS.squidGame.greenDark : COLORS.squidGame.pinkDark;
      ctx.fillRect(x, y, paddleWidth, paddleHeight);
    });

    // Draw player names on top, closer to sides
    ctx.fillStyle = 'white';
    ctx.font = '16px sans-serif';
    const names = gameState.playerNames || {};
    const p1Name = names[currentMatch.p1.id] || currentMatch.p1.name;
    const p2Name = names[currentMatch.p2.id] || currentMatch.p2.name;
    ctx.fillText(p1Name, 20, 20);
    ctx.fillText(p2Name, width - ctx.measureText(p2Name).width - 20, 20);

    // Draw scores in top middle
    const p1Score = gameState.score[currentMatch.p1.id] || 0;
    const p2Score = gameState.score[currentMatch.p2.id] || 0;
    const scoreText = `${p1Score} - ${p2Score}`;
    ctx.font = '20px sans-serif';
    const scoreWidth = ctx.measureText(scoreText).width;
    ctx.fillText(scoreText, (width - scoreWidth) / 2, 25);

    // Draw countdown in top half if active
    if (countdownValue !== null) {
      ctx.fillStyle = 'white';
      ctx.font = '64px sans-serif';
      const text = countdownValue.toString();
      const textWidth = ctx.measureText(text).width;
      ctx.fillText(text, (width - textWidth) / 2, height / 4);
    }

  }

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
    const token = getToken();
    const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;

    ids.forEach((id, index) => {
      const y = gameState.paddles[id] * scaleY;
      const x = index === 0 ? 0 : width - paddleWidth;
      const isCurrentPlayer = id === userId;
      ctx.fillStyle = isCurrentPlayer ? COLORS.squidGame.greenDark : COLORS.squidGame.pinkDark;
      ctx.fillRect(x, y, paddleWidth, paddleHeight);
    });

    // Draw player names on top, closer to sides
    ctx.fillStyle = 'white';
    ctx.font = '16px sans-serif';
    const names = gameState.playerNames || {};
    const p1Name = names[currentMatch.p1.id] || currentMatch.p1.name || currentMatch.p1.id;
    const p2Name = names[currentMatch.p2.id] || currentMatch.p2.name || currentMatch.p2.id;
    ctx.fillText(p1Name, 20, 20);
    ctx.fillText(p2Name, width - ctx.measureText(p2Name).width - 20, 20);

    // Draw scores in top middle
    const p1Score = gameState.score[currentMatch.p1.id] || 0;
    const p2Score = gameState.score[currentMatch.p2.id] || 0;
    const scoreText = `${p1Score} - ${p2Score}`;
    ctx.font = '20px sans-serif';
    const scoreWidth = ctx.measureText(scoreText).width;
    ctx.fillText(scoreText, (width - scoreWidth) / 2, 25);

    // Draw countdown in top half if active
    if (countdownValue !== null) {
      ctx.fillStyle = 'white';
      ctx.font = '64px sans-serif';
      const text = countdownValue.toString();
      const textWidth = ctx.measureText(text).width;
      ctx.fillText(text, (width - textWidth) / 2, height / 4);
    }
  }

  // Keyboard handling for local
  let keys: { [key: string]: boolean } = {};
  document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
  });
  document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
  });

  function sendMove() {
    if (!currentMatch || !wsManager.tournamentWS || !isLocalTournament) return;
    if (keys['ArrowUp']) {
      wsManager.tournamentWS.send(JSON.stringify({ type: 'move', direction: 'up', side: 'right' }));
    }
    if (keys['ArrowDown']) {
      wsManager.tournamentWS.send(JSON.stringify({ type: 'move', direction: 'down', side: 'right' }));
    }
    if (keys['w']) {
      wsManager.tournamentWS.send(JSON.stringify({ type: 'move', direction: 'up', side: 'left' }));
    }
    if (keys['s']) {
      wsManager.tournamentWS.send(JSON.stringify({ type: 'move', direction: 'down', side: 'left' }));
    }
  }

  setInterval(sendMove, 50); // Match game.ts interval

  function draw() {
    if (isLocalTournament) {
      drawGame();
    } else if (isPlayerInMatch) {
      drawOnlineGame();
    }
    requestAnimationFrame(draw);
  }

  draw();
}
