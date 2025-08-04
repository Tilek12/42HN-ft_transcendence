import { renderNav } from './nav'
import { renderBackgroundTop } from '../utils/layout'

export function renderLeaderboard(root: HTMLElement) {
  root.innerHTML = renderNav() + renderBackgroundTop(`
    <div class="pt-24 max-w-xl mx-auto text-white text-center">
      <h1 class="text-3xl font-semibold">Leaderboard</h1>
      <p class="text-gray-400">Top players and match stats.</p>
    </div>
  `)
}
