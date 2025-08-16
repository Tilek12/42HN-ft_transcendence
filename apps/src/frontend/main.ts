
import { router } from './router.js'
import { isLoggedIn } from './utils/auth.js'
import { wsManager } from './websocket/ws-manager.js'

// Initialize SPA router and WebSocket connections
document.addEventListener('DOMContentLoaded', () => {
  // Only connect presence WS if logged in
  if (isLoggedIn()) {
    wsManager.connectPresenceSocket();
  }

  router();
});

// SPA page changes
window.addEventListener('hashchange', router);
