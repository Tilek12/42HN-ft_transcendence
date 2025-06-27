import { renderNav } from './nav'

export function renderGame(root: HTMLElement) {
  root.innerHTML = renderNav() + `
    <div class="text-center">
      <h1 class="text-3xl font-semibold">Game Room</h1>
      <canvas id="gameCanvas" class="border mt-4"></canvas>
    </div>
  `
}
