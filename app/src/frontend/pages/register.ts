import { renderNav } from './nav';

export function renderRegister(root: HTMLElement) {
  root.innerHTML = renderNav() + `
    <div class="max-w-md mx-auto mt-10 bg-white p-8 rounded shadow">
      <h1 class="text-3xl font-bold mb-6 text-center">Create Account</h1>

      <form id="register-form" class="space-y-6">
        <div>
          <label for="username" class="block text-left text-sm font-medium text-gray-700">Username</label>
          <input type="text" id="username" required class="mt-1 block w-full border px-3 py-2 rounded shadow-sm" />
        </div>

        <div>
          <label for="email" class="block text-left text-sm font-medium text-gray-700">Email</label>
          <input type="email" id="email" required class="mt-1 block w-full border px-3 py-2 rounded shadow-sm" />
        </div>

        <div>
          <label for="password" class="block text-left text-sm font-medium text-gray-700">Password</label>
          <input type="password" id="password" required class="mt-1 block w-full border px-3 py-2 rounded shadow-sm" />
        </div>

        <button type="submit" class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded">
          Register
        </button>

        <p id="register-error" class="text-red-600 text-sm mt-2 hidden"></p>
      </form>

      <div class="text-center mt-6">
        <p class="text-sm text-gray-600">Already have an account?</p>
        <a href="#/login" class="text-blue-600 hover:underline font-semibold">Sign In</a>
      </div>
    </div>
  `;

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
