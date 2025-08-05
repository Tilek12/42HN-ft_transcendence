import { renderNav } from './nav'
import { renderBackgroundTop } from '../utils/layout'
import { validateLogin } from '../utils/auth'

export async function renderFriends(root: HTMLElement) {
  const isValid = await validateLogin()
  if (!isValid) {
    location.hash = '#/login'
    return;
  }

  root.innerHTML = renderNav() + renderBackgroundTop(`
    <div class="pt-24 max-w-xl mx-auto text-white text-center">
      <h1 class="text-3xl font-semibold">Friends</h1>
      <p class="text-gray-400">Manage your friends and invitations.</p>
    </div>
  `)
}
