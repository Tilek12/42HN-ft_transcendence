import { renderNav } from './nav'

export function renderSpectate(root: HTMLElement) {
  root.innerHTML = renderNav() + `
    <div class="text-center">
      <h1 class="text-3xl font-semibold">Spectate Matches</h1>
      <p class="text-gray-500">Watch live games happening now.</p>
    </div>
  `
}
