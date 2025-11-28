
import { renderBackgroundFull } from '../utils/layout.js'
export async function renderSettings(root: HTMLElement) {


  root.innerHTML = renderBackgroundFull(`
    <div class="pt-24 max-w-xl mx-auto text-white text-center border-2 border-solid">
      <h1 class="text-3xl font-semibold border-2 border-dashed">Settings</h1>
      <p class="text-gray-400 border-2 border-red-500 border-dashed">Update preferences, password, etc.</p>
    </div>
  `);


}
