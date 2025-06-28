import './styles.css'
import { router } from './router'
import './socket'

// Initialize SPA router
document.addEventListener('DOMContentLoaded', () => {
  router()
})
