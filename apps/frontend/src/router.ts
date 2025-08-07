import { renderMainPage } from './pages/main-page'
import { renderTournament } from './pages/tournament'
import { renderGame } from './pages/game'
import { renderProfile } from './pages/profile'
import { renderTournamentMatch } from './pages/tournament-match'
import { renderLogin } from './pages/login'
import { renderRegister } from './pages/register'
import { renderFriends } from './pages/friends'
import { renderLeaderboard } from './pages/leaderboard'
import { renderSettings } from './pages/settings'
import { renderNotFound } from './pages/not-found'
import { isLoggedIn } from './utils/auth'

export async function router() {
  const root = document.getElementById('app')!;
  const route = location.hash || '#/';

  root.style.opacity = '0';

  setTimeout(() => {
    root.innerHTML = '';

    const protectedRoutes = ['#/profile', '#/friends', '#/game', '#/settings', '#/tournament'];
    if (protectedRoutes.includes(route) && !isLoggedIn()) {
      location.hash = '#/login';
      return;
    }

    switch (route) {
      case '#/tournament': return renderTournament(root);
      case '#/tournament-match': return renderTournamentMatch(root);
      case '#/game': return renderGame(root);
      case '#/profile': return renderProfile(root);
      case '#/login': return renderLogin(root);
      case '#/register': return renderRegister(root);
      case '#/friends': return renderFriends(root);
      case '#/leaderboard': return renderLeaderboard(root);
      case '#/settings': return renderSettings(root);
      case '#/':
      case '': return renderMainPage(root);
      default: return renderNotFound(root);
    }

  }, 100);

  setTimeout(() => {
    root.style.opacity = '1';
  }, 200);
}
