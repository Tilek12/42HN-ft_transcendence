import './styles.css'
import { router } from './router'

// const app = document.querySelector<HTMLDivElement>('#app')!

// app.innerHTML = `
//   <h1 class="text-3xl font-bold text-blue-500">ft_transcendence</h1>
//   <p class="mt-2">Vanilla TypeScript SPA with Tailwind</p>
//   <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded" id="ping">Ping backend</button>
//   <pre id="output" class="mt-4 text-left text-sm mx-auto w-fit bg-white p-2 rounded shadow"></pre>
// `

// document.getElementById('ping')?.addEventListener('click', async () => {
//   const res = await fetch('http://localhost:3001/ping')
//   const data = await res.json()
//   document.getElementById('output')!.textContent = JSON.stringify(data, null, 2)
// })

document.addEventListener('DOMContentLoaded', () => {
  router()
})
