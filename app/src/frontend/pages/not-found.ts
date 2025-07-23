import { renderNav } from './nav'

export function renderNotFound(root: HTMLElement) {
  root.innerHTML = renderNav() + `
    <div class="text-center text-red-600">
      <h1 class="text-3xl font-bold">404</h1>
      <p>Page not found.</p>
    </div>
  `
}
