import { wsManager } from '../websocket/ws-manager.js';
import { languageStore, transelate_per_id, translations_nav } from './languages.js';
import { getUser, clearUser, apiFetch } from '../utils/auth.js'
import { renderConnectionErrorPage } from './error.js';
import { clearUserList } from './renderProfiles.js';


let presenceUnsub: (() => void) | null = null;


export async function initNav() {
	const authButton = document.getElementById('auth-btn');
	const mobileAuthButton = document.getElementById('mobile-auth-btn');
	const mobileMenuBtn = document.getElementById('mobile-menu-btn');
	const mobileMenu = document.getElementById('mobile-menu');
	const hamburgerIcon = document.getElementById('hamburger-icon');
	const closeIcon = document.getElementById('close-icon');

	// Desktop auth button
	if (authButton) {
		authButton.addEventListener('click', () => {
			const user = getUser();
			if (user) {
				listenerLogoutBtn({ preventDefault: () => {} });
			} else {
				location.hash = '/login';
			}
		});
	}

	// Mobile auth button
	if (mobileAuthButton) {
		mobileAuthButton.addEventListener('click', () => {
			const user = getUser();
			if (user) {
				listenerLogoutBtn({ preventDefault: () => {} });
			} else {
				location.hash = '/login';
			}
			// Close mobile menu after action
			if (mobileMenu) mobileMenu.classList.add('hidden');
			if (hamburgerIcon) hamburgerIcon.classList.remove('hidden');
			if (closeIcon) closeIcon.classList.add('hidden');
		});
	}

	// Mobile menu toggle
	if (mobileMenuBtn && mobileMenu && hamburgerIcon && closeIcon) {
		mobileMenuBtn.addEventListener('click', () => {
			const isHidden = mobileMenu.classList.contains('hidden');
			if (isHidden) {
				mobileMenu.classList.remove('hidden');
				hamburgerIcon.classList.add('hidden');
				closeIcon.classList.remove('hidden');
			} else {
				mobileMenu.classList.add('hidden');
				hamburgerIcon.classList.remove('hidden');
				closeIcon.classList.add('hidden');
			}
		});

		// Close mobile menu when clicking on navigation links
		const mobileNavLinks = mobileMenu.querySelectorAll('a');
		mobileNavLinks.forEach(link => {
			link.addEventListener('click', () => {
				mobileMenu.classList.add('hidden');
				hamburgerIcon.classList.remove('hidden');
				closeIcon.classList.add('hidden');
			});
		});
	}

	changeLoginButton(!getUser());
};

async function updateOnlineUsers() {
	const count = wsManager.onlineUserCount;
	const users = wsManager.presenceUserList;
	const badge = document.getElementById('active-users-count');
	const mobileBadge = document.getElementById('mobile-active-users-count');
	const list = document.getElementById('active-users-list');
	const mobileList = document.getElementById('mobile-active-users-list');
	const status = document.getElementById('status_symbol');
	const mobileStatus = document.getElementById('mobile_status_symbol');
	const status2 = document.getElementById('logged_in');

	if (status) { status.classList.remove('bg-red-400'); status.classList.add('bg-green-400'); }
	if (mobileStatus) { mobileStatus.classList.remove('bg-red-400'); mobileStatus.classList.add('bg-green-400'); }
	if (status2) {
		status2.classList.remove('bg-red-400');
		status2.classList.add('bg-green-400');
	}
	if (badge) badge.textContent = `Online Users: ${count}`;
	if (mobileBadge) mobileBadge.textContent = `Online: ${count}`;
	if (list) list.innerHTML = `<div class="px-3 py-2 text-xs font-bold text-purple-300 uppercase tracking-wider border-b border-white/10 mb-1">Online Players</div>` + users.map(u => `<li class="px-3 py-2 hover:bg-purple-500/20 rounded-lg transition-all duration-200 cursor-pointer font-medium">${u.name}</li>`).join('');
	if (mobileList) mobileList.innerHTML = users.map(u => `<li class="text-sm text-white/80 px-2 py-1">${u.name}</li>`).join('');
};

export function changeLoginButton(showLogin: boolean) {
	const authButton = document.getElementById('auth-btn');
	const authText = document.getElementById('auth-text');
	const authIcon = document.getElementById('auth-icon');
	const mobileAuthButton = document.getElementById('mobile-auth-btn');
	const mobileAuthText = document.getElementById('mobile-auth-text');
	const mobileAuthIcon = document.getElementById('mobile-auth-icon');
	const userlist = document.getElementById('user_list');
	const mobileUserlist = document.getElementById('mobile_user_list');

	const loginClass = 'flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5';
	const logoutClass = 'flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5';
	const mobileLoginClass = 'w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 transition-all duration-300';
	const mobileLogoutClass = 'w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-all duration-300';
	const loginIconPath = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>';
	const logoutIconPath = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>';

	if (showLogin) {
		// Desktop
		if (authText) authText.textContent = 'Login';
		if (authButton) authButton.className = loginClass;
		if (authIcon) authIcon.innerHTML = loginIconPath;
		if (userlist) userlist.classList.add("hidden");
		
		// Mobile
		if (mobileAuthText) mobileAuthText.textContent = 'Login';
		if (mobileAuthButton) mobileAuthButton.className = mobileLoginClass;
		if (mobileAuthIcon) mobileAuthIcon.innerHTML = loginIconPath;
		if (mobileUserlist) mobileUserlist.classList.add("hidden");
	} else {
		// Desktop
		if (authText) authText.textContent = 'Logout';
		if (authButton) authButton.className = logoutClass;
		if (authIcon) authIcon.innerHTML = logoutIconPath;
		if (userlist) userlist.classList.remove("hidden");
		
		// Mobile
		if (mobileAuthText) mobileAuthText.textContent = 'Logout';
		if (mobileAuthButton) mobileAuthButton.className = mobileLogoutClass;
		if (mobileAuthIcon) mobileAuthIcon.innerHTML = logoutIconPath;
		if (mobileUserlist) mobileUserlist.classList.remove("hidden");
	}
}


export function logoutFrontend() {
	clearUser();
	// clearUserList();
	wsManager.clearPresenceData();
	wsManager.disconnectAllSockets();
	changeLoginButton(true);
}

const listenerLogoutBtn = async (e: any) => {
	e.preventDefault();
	{
		try {
			// if (!getUser())
			// 	return;
			const resp = await apiFetch('/api/logout',
				{
					method: 'POST',
					credentials: 'include',
				});
			if (!resp.ok) {
				const data = await resp.json();
				alert(`couldnt log out! reason: ${data.message}`);
			}
			console.log(resp);
			logoutFrontend();
			location.hash = '#/';
		} catch (e: any) {
			renderConnectionErrorPage();
			location.hash = '#/';
		}
	}
}

export function hideNav() {
	const navigation = document.getElementById("navigation");
	if (navigation) {
		navigation.classList.add('hidden');
	}
}

export function unhideNav() {
	const navigation = document.getElementById("navigation");
	if (navigation) {
		navigation.classList.remove('hidden');
	}
}


export function renderNav() {
	const nav = document.getElementById("navbar");
	const users = wsManager.presenceUserList;
	const count = wsManager.onlineUserCount;

	// DESIGN change: Removed language selector from navbar header to implement global floating language toggle
	// The language selector was relocated to a floating button (bottom-right corner) available on all pages
	// for consistent UX. This declutters the navigation header and provides language switching everywhere.

	// Subscribe ONCE to presence updates and re-render
	// if (!presenceUnsub) {
		wsManager.subscribeToPresence(() => {requestAnimationFrame(updateOnlineUsers);});
	// }
	// Detect when DOM has been updated and patch content into it
	// requestAnimationFrame(() => updateOnlineUsers());
	if (nav) {
		nav.innerHTML =
			/*html*/
			`
			<style>
				@media (max-width: 1023px) {
					#navigation { display: none !important; }
				}
				@media (min-width: 1024px) {
					#navigation { display: flex !important; }
					#mobile-menu-btn { display: none !important; }
				}
			</style>
			<!-- Modern Gaming Navigation Bar -->
			<div class="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/95 via-gray-900/90 to-gray-900/80 backdrop-blur-xl shadow-lg shadow-black/20">
				<div class="max-w-[1920px] mx-auto px-4 sm:px-6 py-3">
					<div class="flex items-center justify-between">
						<!-- Logo Section -->
						<a href="#/" class="flex items-center gap-2 group flex-shrink-0">
							<div class="relative">
								<!-- Glow effect -->
								<div class="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-75 group-hover:opacity-100 blur transition-all duration-300"></div>
								<!-- Logo icon -->
								<div class="relative w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-all duration-300">
									<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
									</svg>
								</div>
							</div>
							<div class="hidden sm:flex flex-col">
								<span class="text-xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent tracking-tight leading-tight">TRANSCENDENCE</span>
								<span class="text-[10px] text-purple-300/60 font-semibold tracking-wider uppercase">Pong Arena</span>
							</div>
						</a>

						<!-- Desktop Navigation -->
						<nav id="navigation" class="hidden lg:flex items-center gap-1" style="display: none;">
							<a id="nav_game" href="#/game" class="group relative px-6 py-3 text-white font-semibold transition-all duration-300 hover:text-purple-300">
								<span class="relative z-10 flex items-center gap-2">
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
									</svg>
									<span class="hidden lg:inline">Game</span>
								</span>
								<!-- Animated underline -->
								<span class="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
								<!-- Glow on hover -->
								<span class="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></span>
							</a>

							<a id="nav_local_tournament" href="#/local-tournament" class="group relative px-6 py-3 text-white font-semibold transition-all duration-300 hover:text-purple-300">
								<span class="relative z-10 flex items-center gap-2">
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
									</svg>
								</span>
								<span class="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
								<span class="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></span>
							</a>

							<a id="nav_online_tournament" href="#/online-tournament" class="group relative px-6 py-3 text-white font-semibold transition-all duration-300 hover:text-purple-300">
								<span class="relative z-10 flex items-center gap-2">
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
									</svg>
								</span>
								<span class="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
								<span class="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></span>
							</a>

							<a id="nav_leaderboard" href="#/leaderboard" class="group relative px-6 py-3 text-white font-semibold transition-all duration-300 hover:text-purple-300">
								<span class="relative z-10 flex items-center gap-2">
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
									</svg>
								</span>
								<span class="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
								<span class="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></span>
							</a>

							<a id="nav_profile" href="#/profile" class="group relative px-6 py-3 text-white font-semibold transition-all duration-300 hover:text-purple-300">
								<span class="relative z-10 flex items-center gap-2">
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
									</svg>
								</span>
								<span class="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
								<span class="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></span>
							</a>

							<a id="nav_settings" href="#/settings" class="group relative px-6 py-3 text-white font-semibold transition-all duration-300 hover:text-purple-300">
								<span class="relative z-10 flex items-center gap-2">
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
									</svg>
								</span>
								<span class="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
								<span class="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></span>
							</a>
						</nav>

						<!-- Right Side: Online Status & Auth (Desktop) -->
						<div class="hidden lg:flex items-center gap-4">
							<!-- Online Users Badge -->
							<div id="user_list" class="lg:flex group relative items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-full border border-green-400/30 hover:border-green-400/50 transition-all duration-300 cursor-pointer">
								<div class="relative">
									<div id="status_symbol" class="w-2 h-2 rounded-full bg-green-400 shadow-lg shadow-green-400/50"></div>
									<div class="absolute inset-0 w-2 h-2 rounded-full bg-green-400 animate-ping"></div>
								</div>
								<span id="active-users-count" class="text-sm font-bold text-green-300">${count}</span>
								<svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
								</svg>
								<!-- Dropdown -->
								<ul id="active-users-list" class="absolute top-full right-0 mt-3 hidden group-hover:block bg-gray-900/98 backdrop-blur-xl text-white text-sm rounded-2xl p-2 min-w-[220px] max-h-80 overflow-y-auto z-50 border border-purple-500/30 shadow-2xl shadow-purple-500/20">
									<div class="px-3 py-2 text-xs font-bold text-purple-300 uppercase tracking-wider border-b border-white/10 mb-1">Online Players</div>
									${users.map(u => `<li class="px-3 py-2 hover:bg-purple-500/20 rounded-lg transition-all duration-200 cursor-pointer font-medium">${u.name}</li>`).join('')}
								</ul>
							</div>

							<!-- Auth Button -->
							<button type="button" id="auth-btn" class="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5">
								<svg id="auth-icon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
								</svg>
								<span id="auth-text">Login</span>
							</button>
						</div>

						<!-- Mobile Menu Button -->
						<button id="mobile-menu-btn" class="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-purple-600/30 border border-purple-500/50 hover:bg-purple-600/40 transition-all duration-300 flex-shrink-0">
							<svg id="hamburger-icon" class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
							</svg>
							<svg id="close-icon" class="w-6 h-6 text-white hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
							</svg>
						</button>
					</div>

					<!-- Mobile Navigation Menu -->
					<div id="mobile-menu" class="lg:hidden hidden mt-3 pb-3 space-y-2 animate-slideDown">
						<a id="mobile_nav_game" href="#/game" class="flex items-center gap-3 px-4 py-3 text-white font-semibold bg-gray-800/50 hover:bg-gray-800/70 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all duration-200">
							<svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
							<span>Game</span>
						</a>

						<a id="mobile_nav_local_tournament" href="#/local-tournament" class="flex items-center gap-3 px-4 py-3 text-white font-semibold bg-gray-800/50 hover:bg-gray-800/70 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all duration-200">
							<svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
							</svg>
							<span>Local Tournament</span>
						</a>

						<a id="mobile_nav_online_tournament" href="#/online-tournament" class="flex items-center gap-3 px-4 py-3 text-white font-semibold bg-gray-800/50 hover:bg-gray-800/70 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all duration-200">
							<svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
							</svg>
							<span>Online Tournament</span>
						</a>

						<a id="mobile_nav_leaderboard" href="#/leaderboard" class="flex items-center gap-3 px-4 py-3 text-white font-semibold bg-gray-800/50 hover:bg-gray-800/70 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all duration-200">
							<svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
							</svg>
							<span>Leaderboard</span>
						</a>

						<a id="mobile_nav_profile" href="#/profile" class="flex items-center gap-3 px-4 py-3 text-white font-semibold bg-gray-800/50 hover:bg-gray-800/70 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all duration-200">
							<svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
							</svg>
							<span>Profile</span>
						</a>

						<a id="mobile_nav_settings" href="#/settings" class="flex items-center gap-3 px-4 py-3 text-white font-semibold bg-gray-800/50 hover:bg-gray-800/70 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all duration-200">
							<svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
							</svg>
							<span>Settings</span>
						</a>

						<!-- Mobile Online Users -->
						<div id="mobile_user_list" class="hidden px-4 py-3 bg-gray-800/50 rounded-lg border border-green-400/30">
							<div class="flex items-center gap-2 mb-2">
								<div class="relative">
									<div id="mobile_status_symbol" class="w-2 h-2 rounded-full bg-green-400 shadow-lg shadow-green-400/50"></div>
									<div class="absolute inset-0 w-2 h-2 rounded-full bg-green-400 animate-ping"></div>
								</div>
								<span id="mobile-active-users-count" class="text-sm font-bold text-green-300">Online: ${count}</span>
							</div>
							<ul id="mobile-active-users-list" class="space-y-1 max-h-40 overflow-y-auto">
								${users.map(u => `<li class="text-sm text-white/80 px-2 py-1">${u.name}</li>`).join('')}
							</ul>
						</div>

						<!-- Mobile Auth Button -->
						<button type="button" id="mobile-auth-btn" class="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-lg shadow-lg shadow-purple-500/20 transition-all duration-200">
							<svg id="mobile-auth-icon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
							</svg>
							<span id="mobile-auth-text">Login</span>
						</button>
					</div>
					</div>
				</div>
			</div>
			<!-- Spacer for fixed navbar -->
			<div class="h-16"></div>
				`;
	}
	languageStore.subscribe((lang) => {
		console.log("language callback")
		// Desktop navigation
		transelate_per_id(translations_nav, "game", lang, "nav_game");
		transelate_per_id(translations_nav, "local_tournament", lang, "nav_local_tournament");
		transelate_per_id(translations_nav, "online_tournament", lang, "nav_online_tournament");
		transelate_per_id(translations_nav, "leaderboard", lang, "nav_leaderboard");
		transelate_per_id(translations_nav, "profile", lang, "nav_profile");
		transelate_per_id(translations_nav, "settings", lang, "nav_settings");
		transelate_per_id(translations_nav, "online_users", lang, "active-users-list");
		
		// Mobile navigation - updateed text content directly
		const mobileGameNav = document.getElementById('mobile_nav_game');
		const mobileLocalTournamentNav = document.getElementById('mobile_nav_local_tournament');
		const mobileOnlineTournamentNav = document.getElementById('mobile_nav_online_tournament');
		const mobileLeaderboardNav = document.getElementById('mobile_nav_leaderboard');
		const mobileProfileNav = document.getElementById('mobile_nav_profile');
		const mobileSettingsNav = document.getElementById('mobile_nav_settings');
		
		if (mobileGameNav) {
			const textNode = mobileGameNav.querySelector('span');
			if (textNode && (translations_nav as any)[lang]?.game) textNode.textContent = (translations_nav as any)[lang].game;
		}
		if (mobileLocalTournamentNav) {
			const textNode = mobileLocalTournamentNav.querySelector('span');
			if (textNode && (translations_nav as any)[lang]?.local_tournament) textNode.textContent = (translations_nav as any)[lang].local_tournament;
		}
		if (mobileOnlineTournamentNav) {
			const textNode = mobileOnlineTournamentNav.querySelector('span');
			if (textNode && (translations_nav as any)[lang]?.online_tournament) textNode.textContent = (translations_nav as any)[lang].online_tournament;
		}
		if (mobileLeaderboardNav) {
			const textNode = mobileLeaderboardNav.querySelector('span');
			if (textNode && (translations_nav as any)[lang]?.leaderboard) textNode.textContent = (translations_nav as any)[lang].leaderboard;
		}
		if (mobileProfileNav) {
			const textNode = mobileProfileNav.querySelector('span');
			if (textNode && (translations_nav as any)[lang]?.profile) textNode.textContent = (translations_nav as any)[lang].profile;
		}
		if (mobileSettingsNav) {
			const textNode = mobileSettingsNav.querySelector('span');
			if (textNode && (translations_nav as any)[lang]?.settings) textNode.textContent = (translations_nav as any)[lang].settings;
		}
		
		// Updateed auth button text based on current state (Desktop)
		const authText = document.getElementById('auth-text');
		if (authText) {
			const isLogin = authText.textContent === 'Login';
			transelate_per_id(translations_nav, isLogin ? "login" : "logout", lang, "auth-text");
		}
		
		// Updateed auth button text (Mobile)
		const mobileAuthText = document.getElementById('mobile-auth-text');
		if (mobileAuthText) {
			const isLogin = mobileAuthText.textContent === 'Login';
			const key = isLogin ? "login" : "logout";
			if ((translations_nav as any)[lang]?.[key]) {
				mobileAuthText.textContent = (translations_nav as any)[lang][key];
			}
		}
	});

	// Set initial button state based on user login status
	const isLoggedIn = getUser() !== null;
	changeLoginButton(!isLoggedIn);
}
