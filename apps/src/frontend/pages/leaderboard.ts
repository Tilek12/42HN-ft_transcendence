import { renderNav } from './nav'

export function renderLeaderboard(root: HTMLElement) {
  root.innerHTML = renderNav() + `
    <div class="text-center">
      <h1 class="text-3xl font-semibold">Leaderboard</h1>
      <p class="text-gray-500">Top players and match stats.</p>
    </div>
  `
}
