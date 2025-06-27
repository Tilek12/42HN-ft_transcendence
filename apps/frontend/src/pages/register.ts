import { renderNav } from './nav'

export function renderRegister(root: HTMLElement) {
  root.innerHTML = renderNav() + `
    <div class="text-center">
      <h1 class="text-3xl font-semibold">Register</h1>
      <p class="text-gray-500">Create your player account.</p>
    </div>
  `
}
