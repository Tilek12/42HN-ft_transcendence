
import { renderBackgroundTop } from '../utils/layout.js'
import { validateLogin } from '../utils/auth.js'
export async function renderSettings(root: HTMLElement) {


  root.innerHTML = renderBackgroundTop(`
    <div class="pt-24 max-w-xl mx-auto text-white text-center border-2 border-solid">
      <h1 class="text-3xl font-semibold border-2 border-dashed">Settings</h1>
      <p class="text-gray-400 border-2 border-red-500 border-dashed">Update preferences, password, etc.</p>
    </div>
  `);


}
