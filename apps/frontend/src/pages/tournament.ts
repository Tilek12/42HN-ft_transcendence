import { renderNav } from './nav'

export function renderTournament(root: HTMLElement) {
  root.innerHTML = renderNav() + `
    <div class="text-center">
      <h1 class="text-3xl font-semibold">Tournament Bracket</h1>
      <p class="text-gray-500">Upcoming matches and scores.</p>
    </div>
  `
}
