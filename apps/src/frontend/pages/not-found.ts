import { renderNav } from './nav.js'
import { renderBackgroundTop } from '../utils/layout.js'

export function renderNotFound(root: HTMLElement) {
  root.innerHTML = renderNav() + renderBackgroundTop(`
    <div class="pt-24 max-w-xl mx-auto text-center text-red-600">
      <h1 class="text-3xl font-bold">404</h1>
      <p>Page not found.</p>
    </div>
  `)
}
