import { renderNav } from './nav';
import { getToken, validateLogin } from '../utils/auth';
import { createGameSocket } from '../websocket/game';
import {
  connectPresenceSocket,
  getActiveTournaments,
  onPresenceUpdate
} from '../websocket/presence';

let currentTournamentId: string | null = null;

export async function renderTournament(root: HTMLElement) {
  const isValid = await validateLogin();
  if (!isValid) {
    location.hash = '#/login';
    return;
  }

  // Ensure presence connection is active
  connectPresenceSocket();

  root.innerHTML =
    renderNav() +
    `
    <div class="max-w-3xl mx-auto mt-20 p-6 bg-white/10 rounded-xl shadow-lg backdrop-blur-md">
      <h1 class="text-3xl font-bold mb-4 text-center text-black">🏆 Tournament Lobby</h1>
      <p class="text-center text-gray-400 mb-6">Join a tournament and compete for glory!</p>
      <div id="tournament-list" class="space-y-4 text-white"></div>
    </div>
  `;

  renderTournamentList();
  onPresenceUpdate(renderTournamentList);

  function renderTournamentList() {
    const list = document.getElementById('tournament-list')!;
    const tournaments = getActiveTournaments();
    const token = getToken();
    const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;

    list.innerHTML = '';

    const userTournament = tournaments.find(t => t.playerIds.includes(userId));

    if (userTournament) {
      currentTournamentId = userTournament.id;
      list.innerHTML = `
        <div class="text-center text-green-400 mb-4">
          ✅ You have joined Tournament <strong>${userTournament.id}</strong> (${userTournament.joined}/${userTournament.size})
        </div>
      `;
    }

    if (tournaments.length === 0) {
      list.innerHTML += `<p class="text-center text-gray-400">No active tournaments yet.</p>`;
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

    // Start buttons (disabled if already joined)
    list.innerHTML += `
      <div class="text-center mt-6">
        <button class="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold"
          id="start-tournament-4" ${userTournament ? 'disabled' : ''}>
          Start 4-Player Tournament
        </button>
        <button class="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold ml-4"
          id="start-tournament-8" ${userTournament ? 'disabled' : ''}>
          Start 8-Player Tournament
        </button>
      </div>
    `;

    document.getElementById('start-tournament-4')?.addEventListener('click', () => {
      if (!userTournament) joinTournament('', 4);
    });

    document.getElementById('start-tournament-8')?.addEventListener('click', () => {
      if (!userTournament) joinTournament('', 8);
    });
  }

  function joinTournament(id: string, size: 4 | 8) {
    if (currentTournamentId) {
      alert(`⚠️ You're already in Tournament ${currentTournamentId}.`);
      return;
    }

    const token = getToken();
    if (!token) {
      alert('Login required');
      location.hash = '#/login';
      return;
    }

    const socket = createGameSocket('tournament', size, id);
    socket.onmessage = (event) => {
      const msg = event.data;
      if (msg === 'ping') {
        socket.send('pong');
        return;
      }

      try {
        const parsed = JSON.parse(msg);

        if (parsed.type === 'tournamentJoined') {
          currentTournamentId = parsed.id;
          alert('🎮 Joined tournament. Waiting for match...');
          renderTournamentList();
        } else if (parsed.type === 'end') {
          alert(`🏁 Tournament finished! Winner: ${parsed.winner}`);
          currentTournamentId = null;
          socket.close();
        }
      } catch (err) {
        console.warn('❌ Invalid tournament message:', msg);
      }
    };

  }
}
