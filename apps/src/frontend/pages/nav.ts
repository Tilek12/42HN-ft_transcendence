import { wsManager } from '../websocket/ws-manager.js';
import { languageStore, transelate_per_id, translations_nav } from './languages.js';
import { getUser, clearUser} from '../utils/auth.js'
import { renderConnectionErrorPage } from './error.js';


let presenceUnsub: (() => void) | null = null;


export async function initNav() {
	const loginButton = document.getElementById('login-btn');
	const logoutButton = document.getElementById('logout-btn');
	if (loginButton)
		loginButton.addEventListener('click', ()=>{location.hash = '/login'});
	if (logoutButton)
		logoutButton.addEventListener('click', listenerLogoutBtn);
	changeLoginButton(true);
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
	const loginButton = document.getElementById('login-btn');
	const logoutButton = document.getElementById('logout-btn');

	const userlist = document.getElementById('user_list');


	if (logoutButton && loginButton &&userlist) {
		if (!login) {
			logoutButton.classList.remove("hidden");
			loginButton.classList.add("hidden");
			userlist.classList.remove("hidden");

		}
		else {
			loginButton.classList.remove("hidden")
			logoutButton.classList.add("hidden");
			userlist.classList.add("hidden");
		}
	}
}

const listenerLogoutBtn = async (e : any) =>
{
	e.preventDefault();
	{
		try {
		if (!getUser())
			return;
		const resp = await fetch('/api/logout',
				{
					method: 'POST',
					credentials:'include',
				});
		if (!resp.ok)
			alert('couldnt log out');
		console.log(resp);
		clearUser();
		wsManager.clearPresenceData();
		wsManager.disconnectAllSockets();
		changeLoginButton(true);
		location.hash = '#/';
		}catch(e:any){
				renderConnectionErrorPage();
		}
	}
}

export function hideNav()
{
	const navigation = document.getElementById("navigation");
	if (navigation)
	{
		navigation.classList.add('hidden');
	}
}

export function unhideNav()
{
		const navigation = document.getElementById("navigation");
	if (navigation)
	{
		navigation.classList.remove('hidden');
	}
}


export function renderNav() {
	const nav = document.getElementById("navbar");
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
	if (nav) {
		nav.innerHTML =
			/*html*/
			`
			<!-- Logo -->
				<div class="flex items-center ml-5 space-x-1">
						<div class="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
							<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
							</svg>
						</div>
							<a href="#/" class="text-white font-bold text-xl hover:underline rounded">Transcendence</a>
					</div>
			<!--div class="flex items-center justify-between h-16 2 red-500 dashed"-->	
				<nav id="navigation" class="flex flex-wrap justify-center gap-4 white/20 p-2 z-50 ">

					<!-- Navigation Links -->
					<div class="flex flex-wrap gap-2" >
						<a id="nav_game" href="#/game" class=" flex group relative px-4 py-2 rounded-lg text-white/80 hover:text-white transition-all duration-300 hover:bg-white/10">
						<span class="relative z-10"></span>
						</a>

						<a id="nav_tournament" href="#/tournament" class=" flex group relative px-4 py-2 rounded-lg text-white/80 hover:text-white transition-all duration-300 hover:bg-white/10">
						<span class="relative z-10"></span>
						</a>

						<a id="nav_leaderboard" href="#/leaderboard" class="flex group relative px-4 py-2 rounded-lg text-white/80 hover:text-white transition-all duration-300 hover:bg-white/10">
						<span class="relative z-10"></span>
						</a>

						<a id="nav_friends" href="#/friends" class="flex group relative px-4 py-2 rounded-lg text-white/80 hover:text-white transition-all duration-300 hover:bg-white/10">
						<span class="relative z-10"></span>
						</a>

						<a id="nav_profile" href="#/profile" class="flex group relative px-4 py-2 rounded-lg text-white/80 hover:text-white transition-all duration-300 hover:bg-white/10">
						<span class="relative z-10"></span>
						</a>

						<a id="nav_settings" href="#/settings" class="flex group relative px-4 py-2 rounded-lg text-white/80 hover:text-white transition-all duration-300 hover:bg-white/10 ">
						<span class="relative z-10"></span>
						</a>
					</div>

					<!-- Online Users -->
					<div id="user_list" class="group relative text-white cursor-pointer items-center justify-center flex space-x-1">
						<div class="w-3 h-3 rounded-full bg-green-400 animate-pulse">
						</div>
						<span id="active-users-count" class="text-sm">${count}</span>
						<ul id="active-users-list" class="absolute top-full mt-1 hidden group-hover:block bg-white/90 text-black text-sm rounded-lg p-2 max-h-64 overflow-y-auto z-50">
						${users.map(u => `<li>${u.name}</li>`)}
						</ul>
					</div>
						<!-- Login Button -->
						<button type="button" id="login-btn" class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"></button>
						<button type="button" id="logout-btn" class="hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-red-700 hover:to-red-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"></button>
					</nav>
					<!--/div-->
			
				<!-- Language Selector -->
				<div id="language_selector" class="flex mr-5 items-center justify-center ">
					<select id="language-select" class="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-2 text-white rounded ">
						<option value="EN">EN</option>
						<option value="DE">DE</option>
						<option value="GR">ΕΛ</option>
					</select>
				</div>
				`;
	}
	languageStore.subscribe((lang) => {
		console.log("language callback")
		transelate_per_id(translations_nav, "game", lang, "nav_game");
		transelate_per_id(translations_nav, "tournament", lang, "nav_tournament");
		transelate_per_id(translations_nav, "leaderboard", lang, "nav_leaderboard");
		transelate_per_id(translations_nav, "friends", lang, "nav_friends");
		transelate_per_id(translations_nav, "profile", lang, "nav_profile");
		transelate_per_id(translations_nav, "settings", lang, "nav_settings");
		transelate_per_id(translations_nav, "online_users", lang, "active-users-list");
		transelate_per_id(translations_nav, "login", lang, "login-btn");
		transelate_per_id(translations_nav, "logout", lang, "logout-btn");
	});


	
}
