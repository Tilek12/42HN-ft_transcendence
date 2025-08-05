"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderProfile = renderProfile;
const nav_1 = require("./nav");
const layout_1 = require("../utils/layout");
const auth_1 = require("../utils/auth");
const ws_manager_1 = require("../websocket/ws-manager");
async function renderProfile(root) {
    const isValid = await (0, auth_1.validateLogin)();
    if (!isValid) {
        location.hash = '#/login';
        return;
    }
    fetch('/api/private/me', {
        headers: { 'Authorization': `Bearer ${(0, auth_1.getToken)()}` }
    })
        .then(res => res.json())
        .then(data => {
        if (data.message === 'Invalid or expired token') {
            (0, auth_1.clearToken)();
            location.hash = '#/login';
            return;
        }
        root.innerHTML = (0, nav_1.renderNav)() + (0, layout_1.renderBackgroundTop)(`
        <div class="pt-24 max-w-xl mx-auto text-white p-6">
          <h1 class="text-3xl font-bold mb-4">Your Profile</h1>
          <p><strong>Username:</strong> ${data.username}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Joined:</strong> ${new Date(data.created_at).toLocaleString()}</p>
          <button id="logout-btn" class="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">Logout</button>
        </div>
      `);
        requestAnimationFrame(() => {
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    ws_manager_1.wsManager.disconnectAllSockets();
                    ws_manager_1.wsManager.clearPresenceData();
                    (0, auth_1.clearToken)();
                    location.hash = '#/login';
                });
            }
        });
    })
        .catch(() => {
        root.innerHTML = `<p class="text-red-400">❌ Failed to fetch profile.</p>`;
    });
}
//# sourceMappingURL=profile.js.map