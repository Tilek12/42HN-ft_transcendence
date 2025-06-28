import { renderNav } from './nav'

export function renderLogin(root: HTMLElement) {
  root.innerHTML = renderNav() + `
    <div class="max-w-md mx-auto mt-10 bg-white p-8 rounded shadow">
      <h1 class="text-3xl font-bold mb-6 text-center">Sign In</h1>

      <button id="google-login" class="w-full bg-red-500 text-white py-2 px-4 rounded mb-6 hover:bg-red-600">
        🔒 Login via Google
      </button>

      <form id="login-form" class="space-y-6">
        <div>
          <label for="username" class="block text-left text-sm font-medium text-gray-700">Username</label>
          <input type="text" id="username" class="mt-1 block w-full border px-3 py-2 rounded shadow-sm" required />
        </div>

        <div>
          <label for="password" class="block text-left text-sm font-medium text-gray-700">Password</label>
          <input type="password" id="password" class="mt-1 block w-full border px-3 py-2 rounded shadow-sm" required />
        </div>

        <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded">
          Login
        </button>

        <p id="login-error" class="text-red-600 text-sm mt-2 hidden"></p>
      </form>

      <div class="text-center mt-6">
        <p class="text-sm text-gray-600">No account?</p>
        <a href="#/register" class="text-blue-600 hover:underline font-semibold">Register</a>
      </div>
    </div>
  `;

  const form = document.getElementById('login-form') as HTMLFormElement;
  const error = document.getElementById('login-error')!;
  const googleBtn = document.getElementById('google-login')!;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = (document.getElementById('username') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      error.textContent = data.message || 'Login failed';
      error.classList.remove('hidden');
    } else {
      alert('✅ Logged in!');
      location.hash = '#/profile';
    }
  });

  googleBtn.addEventListener('click', async () => {
    // Replace with actual redirect or popup flow later
    alert('🧪 Google login not implemented yet.');
    // Optional: Redirect to OAuth endpoint
    // location.href = '/api/auth/google'
  });
}
