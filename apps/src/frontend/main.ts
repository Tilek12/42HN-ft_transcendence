import './styles.css'
import { router } from './router'
import { isLoggedIn, validateLogin } from './utils/auth'
import { wsManager } from './websocket/ws-manager'
import {changeLoginButton, renderNav} from './pages/nav';
import {initLang, initNav} from './pages/nav';
import {languageStore} from './pages/languages'
// import type {Language} from './pages/languages';
import { toggleLogin } from './pages/nav';


document.getElementById('navbar')!.innerHTML = renderNav();
initLang();
initNav()

languageStore.subscribe (async (lang)=>
	{
		document.getElementById('navbar')!.innerHTML = renderNav();
		const langSelect = document.getElementById('language-select') as HTMLSelectElement;
		const newElement = langSelect.cloneNode(true);
		langSelect.replaceWith(newElement);
		newElement.value  = lang;
		initLang();
		initNav();
		changeLoginButton( !await validateLogin());
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
