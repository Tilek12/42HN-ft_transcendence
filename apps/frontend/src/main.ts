import './styles.css'
import { router } from './router'
import { isLoggedIn } from './utils/auth'
import { wsManager } from './websocket/ws-manager'

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
