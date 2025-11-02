import { wsManager } from '../websocket/ws-manager';
import { languageStore } from './languages';
import type { Language } from '../types';
import { validateLogin } from '../utils/auth';
import { getToken, clearToken } from '../utils/auth'


let presenceUnsub: (() => void) | null = null;

export const translations_nav: Record<Language, { [key: string]: string }> = {
  EN: {
    game: 'Game',
    tournament: 'Tournament',
    leaderboard: 'Leaderboard',
    friends: 'Friends',
    profile: 'Profile',
    settings: 'Settings',
    online_users: 'Online Users',
    login: 'Login',
    logout: 'Logout',
  },
  DE: {
    game: 'Spiel',
    tournament: 'Turnier',
    leaderboard: 'Bestenliste',
    friends: 'Freunde',
    profile: 'Profil',
    settings: 'Einstellungen',
    online_users: 'Online Benutzer',
    login: 'Anmelden',
    logout: 'Abmelden',
  },
  GR: {
    game: 'Παιχνίδι',
    tournament: 'Τουρνουά',
    leaderboard: 'Κατάταξη',
    friends: 'Φίλοι',
    profile: 'Προφίλ',
    settings: 'Ρυθμίσεις',
    online_users: 'Ενεργοί',
    login: 'Σύνδεση',
    logout: 'Αποσύνδεση',
  }
};

export function initLang() {
  const langSelect = document.getElementById('language-select') as HTMLSelectElement;

  // if(!langSelect) console.log('The langSelect is not Existing');
  langSelect?.addEventListener('change', () => {
    console.log('clicked');
    languageStore.clicked++;
    const selected = langSelect.value as 'EN' | 'DE' | 'GR';
    languageStore.language = selected;
  })
  languageStore.subscribe(lang => {
    langSelect.value = lang;
    console.log('the value changed', langSelect.value);
  })

}

export async function initNav() {
  const btn = document.getElementById('login-btn');
  if (btn)
    btn.addEventListener('click', toggleLogin);
  changeLoginButton(!await validateLogin());
};

async function updateOnlineUsers() {
  const count = wsManager.onlineUserCount;
  const users = wsManager.presenceUserList;
  const badge = document.getElementById('active-users-count');
  const list = document.getElementById('active-users-list');

  if (badge) badge.textContent = `Online Users: ${count}`;
  if (list) list.innerHTML = users.map(u => `<li>${u.name || u.id}</li>`).join('');
};

export function changeLoginButton(login: boolean) {
  const button = document.getElementById('login-btn');

  if (button && !login) {
    const logoutText = translations_nav[languageStore.language]?.logout ?? 'Logout';
    button.innerHTML = logoutText;
    button.classList.remove("from-blue-600", "to-purple-600", "hover:from-blue-700", "hover:to-purple-70");
    button.classList.add("from-blue-600", "to-purple-600", "hover:from-red-700", "hover:to-red-700");
  }
  else if (button) {
    const logoutText = translations_nav[languageStore.language]?.login ?? 'Login';
    button.innerHTML = logoutText;
    button.classList.remove("from-blue-600", "to-purple-600", "hover:from-red-700", "hover:to-red-700")
    button.classList.add("from-blue-600", "to-purple-600", "hover:from-blue-700", "hover:to-purple-70");
  }
}

export async function toggleLogin() {

  if (await validateLogin()) {
    // console.log("logging out");

    const token = getToken();
    await fetch('/api/logout',
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
    clearToken();
    wsManager.disconnectAllSockets();
    wsManager.clearPresenceData();
    changeLoginButton(true);
    location.hash = '#/';
  }
  else
  {
    location.hash = '#/login';
  }

}

export function renderNav() {
  const users = wsManager.presenceUserList;
  const count = wsManager.onlineUserCount;

  // Subscribe ONCE to presence updates and re-render
  if (!presenceUnsub) {
    presenceUnsub = wsManager.subscribeToPresence(() => {
      requestAnimationFrame(updateOnlineUsers);
    });
  }

  // Detect when DOM has been updated and patch content into it
  requestAnimationFrame(() => updateOnlineUsers());


  return `
    <nav class="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-2xl">
      <div class="max-w-7xl mx-auto px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center space-x-3">
            <div class="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <a href="#/" class="text-white font-bold text-xl hover:underline focus:outline-none focus:ring-2 focus:ring-white/50 rounded">
              Transcendence
            </a>
          </div>

          <!-- Navigation Links -->
          <div class="flex items-center space-x-1">
            ${[
      ['nav_game', '#/game', translations_nav[languageStore.language]!.game],
      ['nav_tournament', '#/tournament', translations_nav[languageStore.language]!.tournament],
      ['nav_leaderboard', '#/leaderboard', translations_nav[languageStore.language]!.leaderboard],
      ['nav_friends', '#/friends', translations_nav[languageStore.language]!.friends],
      ['nav_profile', '#/profile', translations_nav[languageStore.language]!.profile],
      //   ['nav_settings','#/settings', translations_nav[languageStore.language]!.settings],
    ]
      .map(
        ([id, href, label]) => `
                <a id = "${id}"href="${href}" class="group relative px-4 py-2 rounded-lg text-white/80 hover:text-white transition-all duration-300 hover:bg-white/10">
                  <span class="relative z-10">${label}</span>
                  <div class="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </a>
              `
      )
      .join('')}
          </div>

          <!-- Online Users -->
          <div class="relative group text-white cursor-pointer">
            <div class="flex items-center gap-1">
              <div class="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
              <span id="active-users-count" class="text-sm">${translations_nav[languageStore.language]!.online_users}: ${count}</span>
            </div>
            <ul id="active-users-list" class="absolute right-0 mt-2 hidden group-hover:block bg-white/90 text-black text-sm rounded-lg shadow-lg p-2 max-h-64 overflow-y-auto w-48 z-50">
              ${users.map(u => `<li>${u.name || u.id}</li>`).join('')}
            </ul>
          </div>

          <!-- Login Button -->
          <button type="button" id="login-btn" class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"></button>
		  <div class="flex items-center space-x-2">
			<label for="language-select" class="text-white font-semibold"></label>
			<select id="language-select" 
					class="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
				<option value="EN">EN</option>
				<option value="DE">DE</option>
				<option value="GR">ΕΛ</option>
			</select>
		  </div>
        </div>
      </div>
    </nav>
  `;
}
