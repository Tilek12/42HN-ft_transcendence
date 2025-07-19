import './styles.css'
import { router } from './router'
import { connectPresenceSocket } from './websocket/presence'

// Initialize SPA router
document.addEventListener('DOMContentLoaded', () => {
  connectPresenceSocket()
  router()
})

window.addEventListener('hashchange', router)
