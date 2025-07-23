import './styles.css'
import { router } from './router'
import { isLoggedIn } from './utils/auth'
import { connectPresenceSocket, disconnectPresenceSocket } from './websocket/presence'

// Initialize SPA router
document.addEventListener('DOMContentLoaded', () => {
  if (isLoggedIn()) connectPresenceSocket()
  router()
})

window.addEventListener('hashchange', router)
window.addEventListener('beforeunload', disconnectPresenceSocket) // Graceful disconnect on page/tab close
