import { renderMainPage } from './pages/main-page.js';
import { renderTournament } from './pages/tournament.js';
import { renderGame } from './pages/game.js';
import { renderProfile } from './pages/profile.js';
import { renderLogin } from './pages/login.js';
import { renderRegister } from './pages/register.js';
import { renderFriends } from './pages/friends.js';
import { renderLeaderboard } from './pages/leaderboard.js';
import { renderNotFound } from './pages/not-found.js';
import { validateLogin } from './utils/auth.js';
import { changeLoginButton } from './pages/nav.js';
import { wsManager } from './websocket/ws-manager.js';
import { renderQrcode } from './pages/2fa.js';
import { renderSettings } from './pages/settings.js';
import { initGlobalLanguageSelector } from './utils/globalLanguageSelector.js';

const protectedRoutes = ['#/profile', '#/friends', '#/game', '#/settings', '#/tournament','settings'];
export async function router() 
{
	const root = document.getElementById('app')!;
	let route = location.hash || '#/';
	const navigation = document.getElementById('navigation');
	const navbar = document.getElementById('navbar');
	const isLoggedIn = await validateLogin();

	// Show/hide navbar and navigation based on route
	if (route === '#/login' || route === '#/register') {
		if (navbar) navbar.classList.add("hidden");
		if (navigation) navigation.classList.add("hidden");
	} else {
		if (navbar) navbar.classList.remove("hidden");
		if (navigation) navigation.classList.remove("hidden");
	}
	
	changeLoginButton(!isLoggedIn)

	console.log("router to:", route, " isLoggedIn: ", isLoggedIn?"true":"false");
	if (isLoggedIn)
		wsManager.connectPresenceSocket();

	if (protectedRoutes.includes(route)) {
		if (isLoggedIn)
		{
			console.log("first switch");
			switch (route) {
				case '#/tournament': 
					renderTournament(root);
					break;
				case '#/game': 
					renderGame(root);
					break;
				case '#/profile': 
					renderProfile(root);
					break;
				case '#/friends': 
					renderFriends(root);
					break;
				case '#/leaderboard': 
					renderLeaderboard(root);
					break;
				case '#/settings': 
					renderSettings(root);
					break;
			}
			// Initialize global language selector after rendering
			initGlobalLanguageSelector();
		}
		else
			location.hash = '/login';
	}
	else
	{
		console.log("second switch");
		switch(route)
		{
			case '#/login': 
				renderLogin(root);
				break;
			case '#/register': 
				renderRegister(root);
				break;
			case '#/':
			case '': 
				renderMainPage(root);
				break;
			default: 
				renderNotFound(root);
				break;
		}
		// Initialize global language selector after rendering
		initGlobalLanguageSelector();
	}



}
