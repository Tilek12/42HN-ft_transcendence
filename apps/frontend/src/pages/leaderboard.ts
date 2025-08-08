import { renderNav } from './nav'
import { renderBackgroundTop } from '../utils/layout'

export async function renderLeaderboard(root: HTMLElement) {
  try {
    const tournamentId = 1;
    const res = await fetch(`/api/tournament/${tournamentId}/leaderboard`);

    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }

    const leaderboard = await res.json();

    root.innerHTML = renderNav() + renderBackgroundTop(`
      <div class="pt-24 max-w-xl mx-auto text-white text-center mb-6">
        <h1 class="text-3xl font-semibold">Leaderboard</h1>
        <p class="text-gray-400">Top players.</p>
      </div>

      <div class="overflow-x-auto">
        <table class="mx-auto w-full max-w-4xl border text-left text-black shadow rounded-lg overflow-hidden">
          <thead class="bg-gray-100">
            <tr>
              <th class="py-2 px-4">#</th>
              <th class="py-2 px-4">Username</th>
              <th class="py-2 px-4">Wins</th>
              <th class="py-2 px-4">Losses</th>
              <th class="py-2 px-4">Trophies</th>
              <th class="py-2 px-4">Matches Played</th>
              <th class="py-2 px-4">Wins in Tournament</th>
            </tr>
          </thead>
          <tbody>
            ${leaderboard.map((user: any, index: number) => `
              <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
                <td class="py-2 px-4">${index + 1}</td>
                <td class="py-2 px-4 font-medium">${user.username}</td>
                <td class="py-2 px-4">${user.wins}</td>
                <td class="py-2 px-4">${user.losses}</td>
                <td class="py-2 px-4">${user.trophies}</td>
                <td class="py-2 px-4">${user.matches_played}</td>
                <td class="py-2 px-4">${user.wins_in_tournament}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `);
  } catch (err: any) {
    root.innerHTML = renderNav() + renderBackgroundTop(`
      <div class="pt-24 text-center text-red-500">
        <p>Failed to load leaderboard: ${err.message}</p>
      </div>
    `);
  }
}
