import { renderNav } from './nav'
import { validateLogin } from '../utils/auth'

export async function renderFriends(root: HTMLElement) {
  const isValid = await validateLogin()
  if (!isValid) {
    location.hash = '#/login'
    return;
  }

  root.innerHTML = renderNav() + `
    <div class="text-center">
      <h1 class="text-3xl font-semibold">Friends</h1>
      <p class="text-gray-500">Manage your friends and invitations.</p>
    </div>
  `
}
