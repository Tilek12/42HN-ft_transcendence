import { renderMainPage } from './pages/main-page.js';
import { renderTournament } from './pages/tournament.js';
import { renderGame } from './pages/game.js';
import { renderProfile } from './pages/profile.js';
import { renderLogin } from './pages/login.js';
import { renderRegister } from './pages/register.js';
import { renderFriends } from './pages/friends.js';
import { renderLeaderboard } from './pages/leaderboard.js';
import { renderNotFound } from './pages/not-found.js';
import { getUser, validateLogin } from './utils/auth.js';
import { changeLoginButton, unhideNav } from './pages/nav.js';
import { wsManager } from './websocket/ws-manager.js';
import { renderQrcode } from './pages/2fa.js';
import { renderSettings } from './pages/settings.js'

const protectedRoutes = ['#/profile', '#/friends', '#/game', '#/settings', '#/tournament','settings'];
export async function router() 
{
	const	root = document.getElementById('app')!;
	let		route = location.hash || '#/';
	const	isLoggedIn = getUser() !== undefined || await validateLogin();

	unhideNav();

	if (isLoggedIn)
		wsManager.connectPresenceSocket();

	if (protectedRoutes.includes(route)) {
		if (isLoggedIn)
		{
			console.log("first switch");
			switch (route) {
				case '#/tournament': return renderTournament(root);
				case '#/game': return renderGame(root);
				case '#/profile': return renderProfile(root);
				case '#/friends': return renderFriends(root);
				case '#/leaderboard': return renderLeaderboard(root);
				case '#/settings': return renderSettings(root);
			}
		}
		else
			location.hash = '/login';
	}
	else
	{
		console.log("second switch login : ", isLoggedIn);
		if (isLoggedIn)
		{
			console.log("isLoggedIn");
			switch(route)
			{
				case '#/login':
				case '#/register':
				default: location.hash = '/profile';
			}
		}
		else{
			console.log("else switch");
			
			switch(route)
			{
				case '#/login': return renderLogin(root);
				case '#/register': return renderRegister(root);
				case '#/':
				case '': return renderMainPage(root);
					default: return renderNotFound(root);
				}
			}
		}



}
