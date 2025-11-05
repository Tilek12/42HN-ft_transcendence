import { renderMainPage } from './pages/main-page'
import { renderTournament } from './pages/tournament'
import { renderGame } from './pages/game'
import { renderProfile } from './pages/profile'
import { renderLogin } from './pages/login'
import { renderRegister } from './pages/register'
import { renderFriends } from './pages/friends'
import { renderLeaderboard } from './pages/leaderboard'
import { renderNotFound } from './pages/not-found'
import { validateLogin } from './utils/auth'
import { changeLoginButton } from './pages/nav';
import { wsManager } from './websocket/ws-manager'
import { renderQrcode } from './pages/2fa'


export async function router() {
  const root = document.getElementById('app')!;
  const route = location.hash || '#/';
  const navbar = document.getElementById('navbar');
  const isLoggedIn = await validateLogin();
  if (navbar && navbar.classList.contains("hidden"))
    navbar.classList.remove("hidden")
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
