import './styles.css'
import { router } from './router'
import { isLoggedIn } from './utils/auth'
import { connectPresenceSocket, disconnectPresenceSocket } from './websocket/presence'
import { disconnectGameSocket } from './websocket/game'
import { disconnectTournamentSocket } from './websocket/tournament'

// Initialize SPA router
document.addEventListener('DOMContentLoaded', () => {
  if (isLoggedIn()) connectPresenceSocket()
  router()
})

window.addEventListener('hashchange', router)
window.addEventListener('beforeunload', () => {
  disconnectGameSocket();
  disconnectPresenceSocket();
  disconnectTournamentSocket();
});
