import { renderNav } from './nav'
import { validateLogin } from '../utils/auth'

export async function renderSettings(root: HTMLElement) {
  const isValid = await validateLogin()
  if (!isValid) {
    location.hash = '#/login'
    return;
  }

  root.innerHTML = renderNav() + `
    <div class="text-center">
      <h1 class="text-3xl font-semibold">Settings</h1>
      <p class="text-gray-500">Update preferences, password, etc.</p>
    </div>
  `
}
