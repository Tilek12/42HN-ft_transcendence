"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./styles.css");
const router_1 = require("./router");
const auth_1 = require("./utils/auth");
const ws_manager_1 = require("./websocket/ws-manager");
// Initialize SPA router and WebSocket connections
document.addEventListener('DOMContentLoaded', () => {
    // Only connect presence WS if logged in
    if ((0, auth_1.isLoggedIn)()) {
        ws_manager_1.wsManager.connectPresenceSocket();
    }
    (0, router_1.router)();
});
// SPA page changes
window.addEventListener('hashchange', router_1.router);
//# sourceMappingURL=main.js.map