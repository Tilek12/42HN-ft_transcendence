import { renderNav } from './nav.js'
import { renderBackgroundFull } from '../utils/layout.js'
export function renderNotFound(root: HTMLElement) {
  root.innerHTML = renderBackgroundFull(
   /*html*/`
    <div class="flex flex-col justify-center items-center text-center text-white p-20 min-h-screen">
      <!-- 404 Icon -->
      <svg class="w-24 h-24 text-yellow-400 mb-6 animate-pulse" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M12 3.75v16.5"/>
      </svg>

      <h1 class="text-5xl font-extrabold mb-4">$404 Not found</h1>
      <p class="text-gray-300 mb-6">this resource was not found</p>

      <a href="#/" 
         class="bg-yellow-400 text-gray-900 font-semibold px-6 py-2 rounded hover:bg-yellow-500 transition"
      >
        back to main page
      </a>
    </div>
  `);

}


// export function renderNotFoundPage(t: { title: string; message: string; home_btn: string }): string {
//   return renderBackgroundFull(
//     /*html*/`
//     <div class="flex flex-col justify-center items-center text-center text-white p-20 min-h-screen">
//       <!-- 404 Icon -->
//       <svg class="w-24 h-24 text-yellow-400 mb-6 animate-pulse" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
//         <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M12 3.75v16.5"/>
//       </svg>

//       <h1 class="text-5xl font-extrabold mb-4">${t.title}</h1>
//       <p class="text-gray-300 mb-6">${t.message}</p>

//       <a href="#/" 
//          class="bg-yellow-400 text-gray-900 font-semibold px-6 py-2 rounded hover:bg-yellow-500 transition"
//       >
//         ${t.home_btn}
//       </a>
//     </div>
//   `);
// }