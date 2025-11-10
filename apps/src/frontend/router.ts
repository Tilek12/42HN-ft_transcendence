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


export async function router() {
  const root = document.getElementById('app')!;
  const route = location.hash || '#/';
  const navigation = document.getElementById('navigation');
  const isLoggedIn = await validateLogin();
  if (navigation && navigation.classList.contains("hidden"))
    navigation.classList.remove("hidden")
  changeLoginButton(!isLoggedIn)




if (isLoggedIn)
  wsManager.connectPresenceSocket();

  const protectedRoutes = ['#/profile', '#/friends', '#/game', '#/settings', '#/tournament'];
  if (protectedRoutes.includes(route) && !isLoggedIn) {
    location.hash = '#/login';
    return;
  }

  switch (route) {
    case '#/tournament': return renderTournament(root);
    case '#/game': return renderGame(root);
    case '#/profile': return renderProfile(root);
    case '#/login': return renderLogin(root);
    case '#/register': return renderRegister(root);
    case '#/friends': return renderFriends(root);
    case '#/leaderboard': return renderLeaderboard(root);
    //   case '#/settings': return renderSettings(root);
    case '#/2fa': return renderQrcode(root);
    case '#/':
    case '': return renderMainPage(root);
    default: return renderNotFound(root);
  }


}
