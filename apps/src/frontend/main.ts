import { router } from './router'
import { validateLogin } from './utils/auth'
import { renderNav} from './pages/nav';
import {initLang, initNav} from './pages/nav';
import {languageStore} from './pages/languages'



document.getElementById('navbar')!.innerHTML = renderNav();
initLang();
initNav();
let isLoggedIn = validateLogin();
languageStore.subscribe (async (lang)=>
	{
		document.getElementById('navbar')!.innerHTML = renderNav();
		const langSelect = document.getElementById('language-select') as HTMLSelectElement;
		const newElement = langSelect.cloneNode(true) as HTMLSelectElement;
		langSelect.replaceWith(newElement);
		newElement.value  = lang;
		initLang();
		initNav();
	}
)
// Initialize SPA router and WebSocket connections
document.addEventListener('DOMContentLoaded', () => {
  // Only connect presence WS if logged in => philipp: connect presence already checks for token
 

  router();
});

// SPA page changes
window.addEventListener('hashchange', router);
