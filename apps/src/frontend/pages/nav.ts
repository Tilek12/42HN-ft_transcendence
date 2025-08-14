import { wsManager } from '../websocket/ws-manager';

let presenceUnsub: (() => void) | null = null;

async function updateOnlineUsers() {
  const count = wsManager.onlineUserCount;
  const users = wsManager.presenceUserList;
  const active_users =
  console.log("==============>> FrontEnd Users :", users);

  const badge = document.getElementById('active-users-count');
  const list = document.getElementById('active-users-list');

  if (badge) badge.textContent = `Online Users: ${count}`;
  if (list) list.innerHTML = users.map(u => `<li>${u.name || u.id}</li>`).join('');
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
              ['#/game', 'Game'],
              ['#/tournament', 'Tournament'],
              ['#/leaderboard', 'Leaderboard'],
              ['#/friends', 'Friends'],
              ['#/profile', 'Profile'],
              ['#/settings', 'Settings'],
            ]
              .map(
                ([href, label]) => `
                <a href="${href}" class="group relative px-4 py-2 rounded-lg text-white/80 hover:text-white transition-all duration-300 hover:bg-white/10">
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
              <span id="active-users-count" class="text-sm">Online Users: ${count}</span>
            </div>
            <ul id="active-users-list" class="absolute right-0 mt-2 hidden group-hover:block bg-white/90 text-black text-sm rounded-lg shadow-lg p-2 max-h-64 overflow-y-auto w-48 z-50">
              ${users.map(u => `<li>${u.name || u.id}</li>`).join('')}
            </ul>
          </div>

          <!-- Login Button -->
          <a id="login-btn" href="#/login" class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg">
            Login
          </a>
        </div>
      </div>
    </nav>
  `;
}


// export function renderNav() {
// 	return `
// 	  <nav class="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-2x1">
// 	  	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// 			<div class="flex items-center justify-between h-16">

// 			<!-- OUR LOGO GOES HERE -->
// 				<div class="flex items-center space-x-3">
// 					<div class="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
// 						<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// 							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 1h7v7l9-11h-7z"></path>
// 						</svg>
// 					</div>
// 					<span class="text-white front-bold text-xl hidden sm:block">Transcendence</span>
// 				</div>

// 			<div class="hidden md:flex items-center space-x-1">
// 				<a href="#/" class="nav-link group relative px-4 py-2 rounded-lg text-white/80 hover:text-white transition-all duration-300 hover:bg-white/10">
// 					<span class="relative z-10">Greeting</span>
// 					<div class="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
// 				</a>

// 				<a herf="#/tournament" class="nav-link group relative px-4 py-2 rounded-lg text-white/80 hover:text-white transition-all duration-300 hover:bg-white/10">
// 					<span class="relative z-10">Tournamnet</span>
// 					<div class="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
// 				</a>

// 				<a herf="#/game" class="nav-link group relative px-4 py-2 rounded-lg text-white/80 hover:text-white transition-all duration-300 hover:bg-white/10">
// 					<span class="relative z-10">Game</span>
// 					<div class="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
// 				</a>

// 				<a herf="#/spectate" class="nav-link group relative px-4 py-2 rounded-lg text-white/80 hover:text-white transition-all duration-300 hover:bg-white/10">
// 					<span class="relative z-10">Spectate</span>
// 					<div class="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
// 				</a>

// 				<a herf="#/leaderboard" class="nav-link group relative px-4 py-2 rounded-lg text-white/80 hover:text-white transition-all duration-300 hover:bg-white/10">
// 					<span class="relative z-10">Leaderboard</span>
// 					<div class="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
// 				</a>

// 				<a herf="#/friends" class="nav-link group relative px-4 py-2 rounded-lg text-white/80 hover:text-white transition-all duration-300 hover:bg-white/10">
// 					<span class="relative z-10">Friends</span>
// 					<div class="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
// 				</a>

// 				<a herf="#/profile" class="nav-link group relative px-4 py-2 rounded-lg text-white/80 hover:text-white transition-all duration-300 hover:bg-white/10">
// 					<span class="relative z-10">Profile</span>
// 					<div class="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
// 				</a>

// 				<a herf="#/settings" class="nav-link group relative px-4 py-2 rounded-lg text-white/80 hover:text-white transition-all duration-300 hover:bg-white/10">
// 					<span class="relative z-10">Settings</span>
// 					<div class="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
// 				</a>
// 			</div>

// 			<div class="hidden md:flex items-center space-x-3">
// 				<a href="#/login" class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 opacity-20 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg">
// 					Login
// 				</a>
// 			</div>


// 	  </nav>
// 	`
// }
