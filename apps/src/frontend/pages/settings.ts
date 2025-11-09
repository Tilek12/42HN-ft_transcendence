
import { renderBackgroundTop } from '../utils/layout.js'
import { validateLogin } from '../utils/auth.js'
import { initLang } from './nav.js';
export async function renderSettings(root: HTMLElement) {
  const isValid = await validateLogin()
  if (!isValid) {
    location.hash = '#/login'
    return;
  }

  root.innerHTML = renderBackgroundTop(`
    <div class="pt-24 max-w-xl mx-auto text-white text-center">
      <h1 class="text-3xl font-semibold">Settings</h1>
      <p class="text-gray-400">Update preferences, password, etc.</p>
    </div>
  `);
  initLang();
}
