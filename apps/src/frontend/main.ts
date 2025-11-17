import { router } from './router.js'
import { initNav, renderNav } from './pages/nav.js';
import { languageStore } from './pages/languages.js'
import { Language } from './types.js';

renderNav();
initNav();
languageStore.initLang();

//get Language ftom localStoage if website has been visited before ele put default english
let lang = localStorage.getItem('PongLanguage') as Language;
if (!lang)
{
	lang = 'EN'
}
languageStore.language = lang;

// Initialize SPA router and WebSocket connections
document.addEventListener('DOMContentLoaded', () => {
	router();
});

// SPA page changes
window.addEventListener('hashchange', router);
