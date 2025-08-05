import { renderNav } from './nav';
import { renderBackgroundTop } from '../utils/layout';
import { getToken, validateLogin } from '../utils/auth';
import { wsManager } from '../websocket/ws-manager';

let currentTournamentId: string | null = null;

export async function renderTournament(root: HTMLElement) {
  const isValid = await validateLogin();
  if (!isValid) {
    location.hash = '#/login';
    return;
  }

  root.innerHTML = renderNav() + renderBackgroundTop(`
    <div class="max-w-3xl mx-auto mt-20 p-6 bg-white/10 rounded-xl shadow-lg backdrop-blur-md">
      <h1 class="text-3xl font-bold mb-4 text-center text-white">🏆 Tournament Lobby</h1>
      <p class="text-center text-gray-400 mb-6">Join a tournament and compete for glory!</p>
      <div id="tournament-list" class="space-y-4 text-white"></div>
    </div>
  `);

  renderTournamentList();
  wsManager.subscribeToPresence(renderTournamentList);

  function handleTournamentMessage(msg: any) {
    if (msg.type === 'matchStart') {
      const token = getToken();
      const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;

      if (msg.player1 === userId || msg.player2 === userId) {
        // 🎯 Player is part of this match – redirect to tournament-match
        sessionStorage.setItem('currentTournamentMatch', JSON.stringify(msg));
        location.hash = '#/tournament-match';
      } else {
        console.log('🎯 Spectating match in tournament bracket');
        // Optionally update bracket display live here
      }
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
      emptyMsg.className = 'text-center text-gray-400';
      emptyMsg.textContent = 'No active tournaments yet.';
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
        Create 4-Player Tournament
      </button>
      <button class="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold ml-4"
        id="create-tournament-8" ${userTournament ? 'disabled' : ''}>
        Create 8-Player Tournament
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
}
