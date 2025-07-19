import { renderNav } from './nav';
import { getToken } from '../utils/auth';
import { createGameSocket } from '../websocket/game';
import { connectPresenceSocket, getActiveTournaments, onPresenceUpdate } from '../websocket/presence';

export function renderTournament(root: HTMLElement) {
  root.innerHTML =
    renderNav() + `
    <div class="max-w-3xl mx-auto mt-20 p-6 bg-white/10 rounded-xl shadow-lg backdrop-blur-md">
      <h1 class="text-3xl font-bold mb-4 text-center text-black">🏆 Tournament Lobby</h1>
      <p class="text-center text-gray-400 mb-6">Join a tournament and compete for glory!</p>
      <div id="tournament-list" class="space-y-4 text-white"></div>
    </div>
  `;

  connectPresenceSocket();
  renderTournamentList();

  onPresenceUpdate(renderTournamentList); // 🔁 Real-time updates

  function renderTournamentList() {
    const list = document.getElementById('tournament-list')!;
    const tournaments = getActiveTournaments();

    list.innerHTML = '';

    if (!tournaments.length) {
      list.innerHTML = `<p class="text-center text-gray-400">No active tournaments. Start one below!</p>`;
    }

    for (const t of tournaments) {
      const isFull = t.joined >= t.size;

      const div = document.createElement('div');
      div.className = `border border-white/20 p-4 rounded-lg bg-black/30 flex justify-between items-center`;

      div.innerHTML = `
        <div>
          <h2 class="font-semibold text-lg">Tournament ${t.id}</h2>
          <p class="text-sm text-gray-300">Host: ${t.hostId}</p>
          <p class="text-sm text-gray-300">${t.joined}/${t.size} players joined</p>
        </div>
        <button
          ${isFull ? 'disabled' : ''}
          class="px-4 py-2 rounded bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium"
          data-id="${t.id}"
          data-size="${t.size}"
        >
          ${isFull ? 'Full' : 'Join'}
        </button>
      `;

      const button = div.querySelector('button')!;
      if (!isFull) {
        button.addEventListener('click', () => {
          joinTournament(t.size);
        });
      }

      list.appendChild(div);
    }

    // Start buttons
    list.innerHTML += `
      <div class="text-center mt-6">
        <button class="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold" id="start-tournament-4">Start 4-Player Tournament</button>
        <button class="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold ml-4" id="start-tournament-8">Start 8-Player Tournament</button>
      </div>
    `;

    document.getElementById('start-tournament-4')?.addEventListener('click', () =>
      joinTournament(4)
    );
    document.getElementById('start-tournament-8')?.addEventListener('click', () =>
      joinTournament(8)
    );
  }

  function joinTournament(size: 4 | 8) {
    const token = getToken();
    if (!token) {
      alert('Login required');
      location.hash = '#/login';
      return;
    }

    const socket = createGameSocket('tournament', size);
    socket.onmessage = (event) => {
      const msg = event.data;
      if (msg === 'ping') {
        socket.send('pong');
        return;
      }

      const parsed = JSON.parse(msg);
      if (parsed.type === 'update') {
        // Optional: animate wait screen
      } else if (parsed.type === 'end') {
        alert(`🏁 Tournament match over! Winner: ${parsed.winner}`);
        socket.close();
      }
    };

    alert('🎮 Joined tournament. Waiting for match to begin...');
  }
}
