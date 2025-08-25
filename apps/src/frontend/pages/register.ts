import { renderNav } from './nav';
import { renderBackgroundFull } from '../utils/layout';
import { initLang } from './nav';
export function renderRegister(root: HTMLElement) {
  root.innerHTML = renderBackgroundFull(`
    <div class="w-full max-w-md">
      <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
        <h1 class="text-3xl font-bold text-white mb-6 text-center">Create Account</h1>
        <form id="register-form" class="space-y-6">
          <div>
            <label for="username" class="block text-sm font-medium text-white">Username</label>
            <input type="text" id="username" required class="mt-1 w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-sm" />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-white">Email</label>
            <input type="email" id="email" required class="mt-1 w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-sm" />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-white">Password</label>
            <input type="password" id="password" required class="mt-1 w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-sm" />
          </div>

          <button type="submit" class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg">
            Register
          </button>

          <p id="register-error" class="text-red-400 text-sm mt-2 hidden"></p>
        </form>

        <div class="text-center mt-6">
          <p class="text-sm text-gray-300">Already have an account?</p>
          <a href="#/login" class="text-blue-400 hover:underline font-semibold">Sign In</a>
        </div>
      </div>
    </div>
  `);
	initLang();
  const form = document.getElementById('register-form') as HTMLFormElement;
  const error = document.getElementById('register-error')!;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = (document.getElementById('username') as HTMLInputElement).value;
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      error.textContent = data.message || '❌ Registration failed.';
      error.classList.remove('hidden');
      return;
    }

    alert('✅ Registration successful! Please log in.');
    location.hash = '#/login';
  });
}
