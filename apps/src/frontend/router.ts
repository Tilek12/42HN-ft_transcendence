import { renderMainPage } from './pages/main-page.js';
import { renderOnlineTournament } from './pages/tournament-online.js';
import { renderLocalTournament } from './pages/tournament-local.js';
import { renderGame } from './pages/game.js';
import { renderProfile } from './pages/profile.js';
import { renderLogin } from './pages/login.js';
import { renderRegister } from './pages/register.js';
// import { renderFriends } from './pages/friends.js';
import { renderLeaderboard } from './pages/leaderboard.js';
import { renderNotFound } from './pages/not-found.js';
import { getUser, validateLogin } from './utils/auth.js';
import { changeLoginButton, unhideNav } from './pages/nav.js';
import { wsManager } from './websocket/ws-manager.js';
import { renderQrcode } from './pages/2fa.js';
import { renderSettings } from './pages/settings.js';
// DESIGN change: Import global language selector initializer to enable floating language toggle on all pages
import { initGlobalLanguageSelector } from './utils/globalLanguageSelector.js';
import { renderMatchSummary } from './pages/renderMatchSummary.js';

const protectedRoutes = ['#/profile', '#/game', '#/settings', '#/online-tournament', '#/local-tournament', '#/settings', '#/leaderboard'];
export async function router()
{
	const	root = document.getElementById('app')!;
	let		route = location.hash || '#/';
	const	isLoggedIn = getUser() !== null || await validateLogin();
	// console.log("getUser() !== null:",getUser() !== null )
	changeLoginButton(!isLoggedIn);
	unhideNav();

	if (isLoggedIn)
		wsManager.connectPresenceSocket();

	if (protectedRoutes.includes(route)) {
		if (isLoggedIn)
		{
			console.log("first switch");
			switch (route) {
				case '#/online-tournament':
					renderOnlineTournament(root);
					break;
				case '#/local-tournament':
					renderLocalTournament(root);
					break;
				case '#/game':
					renderGame(root);
					break;
				case '#/profile':
					renderProfile(root);
					break;
				case '#/leaderboard':
					renderMatchSummary(root);
					break;
				case '#/settings':
					renderSettings(root);
					break;
			}
			// DESIGN change: Initialize global language selector after each page render to ensure floating toggle works
			// across all protected routes. The selector needs re-initialization after DOM updates to attach event listeners properly.

		}
		else
			return location.hash = '/login';
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
				default: return location.hash = '/profile';
			}
		}
		else{
			console.log("else switch");

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
				}

		}
			// DESIGN change: Initialize global language selector for public routes (login, register, main page)
		// ensuring consistent language toggle availability throughout the entire application

	}

}
