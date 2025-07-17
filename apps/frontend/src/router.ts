import { renderGreeting } from './pages/greeting'
import { renderTournament } from './pages/tournament'
import { renderGame } from './pages/game'
import { renderProfile } from './pages/profile'
import { renderSpectate } from './pages/spectate'
import { renderLogin } from './pages/login'
import { renderRegister } from './pages/register'
import { renderFriends } from './pages/friends'
import { renderLeaderboard } from './pages/leaderboard'
import { renderSettings } from './pages/settings'
import { renderNotFound } from './pages/not-found'
import { isLoggedIn } from './utils/auth'

export function router() {
  const root = document.getElementById('app')!
  root.innerHTML = ''

  const route = location.hash || '#/'

  const protectedRoutes = ['#/profile', '#/friends', '#/game', '#/settings']
  if (protectedRoutes.includes(route) && !isLoggedIn()) {
    location.hash = '#/login'
    return
  }

  switch (route) {
    case '#/tournament': return renderTournament(root)
    case '#/game': return renderGame(root)
    case '#/profile': return renderProfile(root)
    case '#/spectate': return renderSpectate(root)
    case '#/login': return renderLogin(root)
    case '#/register': return renderRegister(root)
    case '#/friends': return renderFriends(root)
    case '#/leaderboard': return renderLeaderboard(root)
    case '#/settings': return renderSettings(root)
    case '#/not-found': return renderNotFound(root)
    case '#/':
    case '': return renderGreeting(root)
    default: return renderNotFound(root)
  }
}
