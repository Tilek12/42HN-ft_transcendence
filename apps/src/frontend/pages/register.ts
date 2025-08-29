import { renderNav } from './nav';
import { renderBackgroundFull } from '../utils/layout';
import { initLang } from './nav';
import {languageStore, translations_register_page, transelate_per_id} from './languages';
import type {Language} from './languages';


export function renderRegister(root: HTMLElement) {
	const t = translations_register_page[languageStore.language];

	root.innerHTML = renderBackgroundFull(`
    <div class="w-full max-w-md">
      <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
        <h1 id="register_header" class="text-3xl font-bold text-white mb-6 text-center">${t!.register_header}</h1>
        <form id="register-form" class="space-y-6">
          <div>
            <label id="username_label" for="username" class="block text-sm font-medium text-white">${t!.username_label}</label>
            <input type="text" id="username" placeholder="${t!.username_placeholder}" required class="mt-1 w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-sm" />
          </div>

          <div>
            <label id="email_label" for="email" class="block text-sm font-medium text-white">${t!.email_label}</label>
            <input type="email" id="email" placeholder="${t!.email_placeholder}" required class="mt-1 w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-sm" />
          </div>

          <div>
            <label id="password_label" for="password" class="block text-sm font-medium text-white">${t!.password_label}</label>
            <input type="password" id="password" placeholder="${t!.password_placeholder}" required class="mt-1 w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-sm" />
          </div>

          <button type="submit" id="register_btn" class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg">
            ${t!.register_btn}
          </button>

          <p id="register_error" class="text-red-400 text-sm mt-2 hidden">${t!.register_error}</p>
        </form>

        <div class="text-center mt-6">
          <p id="already_have_account" class="text-sm text-gray-300">${t!.already_have_account}</p>
          <a id="sign_in_link" href="#/login" class="text-blue-400 hover:underline font-semibold">${t!.sign_in}</a>
        </div>
      </div>
    </div>
  `);

	// ✅ Update translations when language changes
	languageStore.subscribe((lang) => {
		const tr = translations_register_page[lang];

		transelate_per_id(translations_register_page,"register_header", lang, "register_header");
		transelate_per_id(translations_register_page,"username_label", lang, "username_label");
		transelate_per_id(translations_register_page,"username_placeholder", lang, "username");
		transelate_per_id(translations_register_page,"email_label", lang, "email_label");
		transelate_per_id(translations_register_page,"email_placeholder", lang, "email");
		transelate_per_id(translations_register_page,"password_label", lang, "password_label");
		transelate_per_id(translations_register_page,"password_placeholder", lang, "password");
		transelate_per_id(translations_register_page,"register_btn", lang, "register_btn");
		transelate_per_id(translations_register_page,"register_error", lang, "register_error");
		transelate_per_id(translations_register_page,"already_have_account", lang, "already_have_account");
		transelate_per_id(translations_register_page,"sign_in", lang, "sign_in_link");
		
	});
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
