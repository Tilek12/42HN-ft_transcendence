import { renderNav } from './nav';
import { renderBackgroundFull } from '../utils/layout';
import { initLang } from './nav';
import {languageStore, translations_register_page, transelate_per_id} from './languages';
import type {Language} from './languages';


export function renderRegister(root: HTMLElement) {
	const t = translations_register_page[languageStore.language];
  const qrt = "data:image/png;base64,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"
	root.innerHTML = renderBackgroundFull(`
    <div class="w-full max-w-md">
      <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
        <h1 id="register_header" class="text-3xl font-bold text-white mb-6 text-center">${t!.register_header}</h1>
        <form id="register_form" class="space-y-6" hidden>
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
          <div class="flex items-center justify-center space-x-2">
            <input id="2fa_checkbox" type="checkbox" class="appearance-none h-5 w-5 border border-white/30 bg-grey/10 rounded checked:bg-blue-600 checked:after:content-['x'] checked:after:text-white flex items-center justify-center" />
            <label  class="text-sm font-medium text-white">
              ${t!.tfa_label}
            </label>
          </div>
          <button type="submit" id="register_btn" class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg">
            ${t!.register_btn}
          </button>
          <p id="register_error" class="text-red-400 text-sm mt-2 hidden">${t!.register_error}</p>
        </form>
        <form id="tfa_container" hidden class=" flex flex-col items-center justify-center">
        <img src="${qrt}" class="rounded">
        <div id="token_input" class="flex flex-row">
        <input type="numeric" pattern="\d"class="relative w-7 h-10 m-1 text-center rounded  border-white-20">
        <input type="numeric" pattern="\d"class="relative w-7 h-10 m-1 text-center rounded  border-white-20">
        <input type="numeric" pattern="\d"class="relative w-7 h-10 m-1 text-center rounded  border-white-20">
        <input type="numeric" pattern="\d"class="relative w-7 h-10 m-1 text-center rounded  border-white-20">
        <input type="numeric" pattern="\d"class="relative w-7 h-10 m-1 text-center rounded  border-white-20">
        <input type="numeric" pattern="\d"class="relative w-7 h-10 m-1 text-center rounded  border-white-20">
        </div>
        <button id="token_submit" type="submit" class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg">Submit</button>
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
  const form = document.getElementById('register_form') as HTMLFormElement;
  const error = document.getElementById('register_error')!;
  const navbar = document.getElementById('navbar');
  if (navbar)
    navbar.classList.add("hidden");

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = (document.getElementById('username') as HTMLInputElement).value;
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;
    const tfa:boolean = (document.getElementById('2fa_checkbox') as HTMLInputElement).checked;
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, tfa}),
    });

    const data = await res.json();

    if (!res.ok) {
      error.textContent = data.message || '❌ Registration failed.';
      error.classList.remove('hidden');
      return;
    }
    if (tfa)
    {
      form.classList.add('hidden');
      const tfa_container = document.getElementById('tfa_container') as HTMLDivElement;
      const qr = data.qr;
        console.log("no qrcode gotten: ", qr);
      tfa_container.innerHTML = `
      <img src="${qr}" class="justify-center items-center ">
      `
      tfa_container.classList.remove("hidden");
    }
    
    // location.hash = '#/login';
    // console.log({email, username, password, tfa})
  });
}
