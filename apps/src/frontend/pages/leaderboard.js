"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderLeaderboard = renderLeaderboard;
const nav_1 = require("./nav");
const layout_1 = require("../utils/layout");
function renderLeaderboard(root) {
    root.innerHTML = (0, nav_1.renderNav)() + (0, layout_1.renderBackgroundTop)(`
    <div class="pt-24 max-w-xl mx-auto text-white text-center">
      <h1 class="text-3xl font-semibold">Leaderboard</h1>
      <p class="text-gray-400">Top players and match stats.</p>
    </div>
  `);
}
//# sourceMappingURL=leaderboard.js.map