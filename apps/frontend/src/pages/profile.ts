import { renderNav } from './nav'
import { getToken, isLoggedIn, clearToken } from '../utils/auth';

export function renderProfile(root: HTMLElement) {
  if (!isLoggedIn()) {
    location.hash = '#/login';
    return;
  }

  root.innerHTML = renderNav() + `
    <div class="text-center">
      <h1 class="text-3xl font-semibold">Your Profile</h1>
      <p class="text-gray-500">User info, avatar, and match history.</p>
    </div>
  `

  fetch('/api/me', {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  })
    .then(res => res.json())
    .then(data => {
      if (data.message === 'Invalid or expired token') {
        clearToken();
        location.hash = '#/login';
        return;
      }

      root.innerHTML = `
        <div class="max-w-xl mx-auto text-white p-6">
          <h1 class="text-3xl font-bold mb-4">Your Profile</h1>
          <p><strong>Username:</strong> ${data.username}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Joined:</strong> ${new Date(data.created_at).toLocaleString()}</p>

          <button id="logout-btn" class="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">Logout</button>
        </div>
      `;

      document.getElementById('logout-btn')?.addEventListener('click', () => {
        clearToken();
        location.hash = '#/login';
      });
    })
    .catch(() => {
      root.innerHTML = `<p class="text-red-400">❌ Failed to fetch profile.</p>`;
    });

}
