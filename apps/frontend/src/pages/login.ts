import { renderNav } from './nav'

export function renderLogin(root: HTMLElement) {
  root.innerHTML = renderNav() + `
    <div class="text-center">
      <h1 class="text-3xl font-semibold">Login</h1>
      <p class="text-gray-500">Access your account.</p>
    </div>
  `
}
