import { renderNav } from './nav'

export function renderFriends(root: HTMLElement) {
  root.innerHTML = renderNav() + `
    <div class="text-center">
      <h1 class="text-3xl font-semibold">Friends</h1>
      <p class="text-gray-500">Manage your friends and invitations.</p>
    </div>
  `
}
