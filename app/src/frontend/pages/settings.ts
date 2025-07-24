import { renderNav } from './nav'

export function renderSettings(root: HTMLElement) {
  root.innerHTML = renderNav() + `
    <div class="text-center">
      <h1 class="text-3xl font-semibold">Settings</h1>
      <p class="text-gray-500">Update preferences, password, etc.</p>
    </div>
  `
}
