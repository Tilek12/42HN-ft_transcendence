import { renderNav } from './nav'

export function renderProfile(root: HTMLElement) {
  root.innerHTML = renderNav() + `
    <div class="text-center">
      <h1 class="text-3xl font-semibold">Your Profile</h1>
      <p class="text-gray-500">User info, avatar, and match history.</p>
    </div>
  `
}
