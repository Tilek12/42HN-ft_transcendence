import './styles.css'
import { router } from './router'
import { isLoggedIn } from './utils/auth'
import { wsManager } from './websocket/ws-manager'
import {renderNav} from './pages/nav';
import {initLang} from './pages/nav';
import {languageStore} from './pages/languages'
// import type {Language} from './pages/languages';
document.getElementById('navbar')!.innerHTML = renderNav();
initLang();

languageStore.subscribe ((lang)=>
	{
		document.getElementById('navbar')!.innerHTML = renderNav();
		const langSelect = document.getElementById('language-select') as HTMLSelectElement;
		const newElement = langSelect.cloneNode(true);
		langSelect.replaceWith(newElement);
		newElement.value  = lang;
		initLang();
	}
)
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
