export function renderNav() {
	return `
	  <nav class="bg-white shadow p-4 flex justify-center gap-4 mb-4">
		<a href="#/" class="hover:underline">Greeting</a>
		<a href="#/tournament" class="hover:underline">Tournament</a>
		<a href="#/game" class="hover:underline">Game</a>
		<a href="#/spectate" class="hover:underline">Spectate</a>
		<a href="#/leaderboard" class="hover:underline">Leaderboard</a>
		<a href="#/friends" class="hover:underline">Friends</a>
		<a href="#/profile" class="hover:underline">Profile</a>
		<a href="#/settings" class="hover:underline">Settings</a>
		<a href="#/login" class="hover:underline">Login</a>
	  </nav>
	`
}
