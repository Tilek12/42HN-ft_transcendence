"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderFriends = renderFriends;
const nav_1 = require("./nav");
const layout_1 = require("../utils/layout");
const auth_1 = require("../utils/auth");
async function renderFriends(root) {
    const isValid = await (0, auth_1.validateLogin)();
    if (!isValid) {
        location.hash = '#/login';
        return;
    }
    root.innerHTML = (0, nav_1.renderNav)() + (0, layout_1.renderBackgroundTop)(`
    <div class="pt-24 max-w-xl mx-auto text-white text-center">
      <h1 class="text-3xl font-semibold">Friends</h1>
      <p class="text-gray-400">Manage your friends and invitations.</p>
    </div>
  `);
}
//# sourceMappingURL=friends.js.map