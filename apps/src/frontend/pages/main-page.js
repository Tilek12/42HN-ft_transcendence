"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderMainPage = renderMainPage;
const nav_1 = require("./nav");
const layout_1 = require("../utils/layout");
function renderMainPage(root) {
    root.innerHTML = (0, nav_1.renderNav)() + (0, layout_1.renderBackgroundFull)(`
	  <div class="h-screen flex flex-col justify-center items-center text-center text-white">
		<h1 class="text-4xl font-bold mb-4">Welcome to Pong Game!</h1>
		<p class="text-gray-400 mb-6">Start the game and prove your skills.</p>
		<a href="#/game" class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition">
		  View Game
		</a>
	  </div>
	`);
}
//# sourceMappingURL=main-page.js.map