import './styles.css'
import { router } from './router'
import { isLoggedIn } from './utils/auth'
import { wsManager } from './websocket/ws-manager'
import {renderNav} from './pages/nav';
import {initLang} from './pages/nav';
document.getElementById('navbar')!.innerHTML = renderNav();
initLang();

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
