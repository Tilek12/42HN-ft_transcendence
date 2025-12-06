import { renderBackgroundFull } from "../utils/layout.js";


export function renderConnectionErrorPage(message?:string) {
	const root = document.getElementById('app');
	if (root)
		root.innerHTML = renderBackgroundFull(
    /*html*/`
    <div class="flex flex-col justify-center items-center text-center text-white p-20">
      <svg class="w-20 h-20 text-red-500 mb-6 animate-pulse" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <h1 class="text-4xl font-bold mb-4">Something went wrong!</h1>
      <p class="text-gray-300 mb-6">${message?message:'Server not available'}</p>
      <button 
        id="retryBtn" 
        class="bg-red-500 text-white font-semibold px-6 py-2 rounded hover:bg-red-600 transition"
      >
       try again
      </button>
    </div>
    `
		);
	const button = document.getElementById('retryBtn');
	if (button) {
		button.addEventListener('click', () => {
			location.hash = '/profile';
		});
	}
}
