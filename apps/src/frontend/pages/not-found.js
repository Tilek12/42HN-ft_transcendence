"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderNotFound = renderNotFound;
const nav_1 = require("./nav");
const layout_1 = require("../utils/layout");
function renderNotFound(root) {
    root.innerHTML = (0, nav_1.renderNav)() + (0, layout_1.renderBackgroundTop)(`
    <div class="pt-24 max-w-xl mx-auto text-center text-red-600">
      <h1 class="text-3xl font-bold">404</h1>
      <p>Page not found.</p>
    </div>
  `);
}
//# sourceMappingURL=not-found.js.map