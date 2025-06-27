import { renderNav } from "./nav"

export function renderGreeting(root: HTMLElement) {
	root.innerHTML = renderNav() + `
	  <div class="h-screen flex flex-col justify-center items-center text-center">
		<h1 class="text-4xl font-bold mb-4">Welcome to Pong Game!</h1>
		<p class="text-gray-500 mb-6">Join the tournament and prove your skills.</p>
		<a href="#/tournament" class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition">
		  View Tournament
		</a>
	  </div>
	`
}
