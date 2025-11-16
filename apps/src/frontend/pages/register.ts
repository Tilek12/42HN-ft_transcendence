
import { renderBackgroundFull } from '../utils/layout.js';
import { languageStore, translations_register_page, transelate_per_id } from './languages.js';
import { saveToken } from '../utils/auth.js';


export function renderRegister(root: HTMLElement) {
  const t = translations_register_page[languageStore.language];
  root.innerHTML = renderBackgroundFull(`
    <div class="w-full max-w-md">
      <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
        <h1 id="register_header" class="text-3xl font-bold text-white mb-6 text-center">${t!.register_header}</h1>
        <form id="register_form" class="space-y-6">
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
          <p id="register_error" class="text-red-400 bg-gray-300 text-sm mt-2 hidden">${t!.register_error}</p>
        </form>
        <form id="tfa_container" hidden class=" flex flex-col items-center justify-center">
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

    transelate_per_id(translations_register_page, "register_header", lang, "register_header");
    transelate_per_id(translations_register_page, "username_label", lang, "username_label");
    transelate_per_id(translations_register_page, "username_placeholder", lang, "username");
    transelate_per_id(translations_register_page, "email_label", lang, "email_label");
    transelate_per_id(translations_register_page, "email_placeholder", lang, "email");
    transelate_per_id(translations_register_page, "password_label", lang, "password_label");
    transelate_per_id(translations_register_page, "password_placeholder", lang, "password");
    transelate_per_id(translations_register_page, "register_btn", lang, "register_btn");
    transelate_per_id(translations_register_page, "register_error", lang, "register_error");
    transelate_per_id(translations_register_page, "already_have_account", lang, "already_have_account");
    transelate_per_id(translations_register_page, "sign_in", lang, "sign_in_link");

  });
  const form = document.getElementById('register_form') as HTMLFormElement;
  const error = document.getElementById('register_error')!;
  const navigation = document.getElementById('navigation');
  if (navigation)
    navigation.classList.add("hidden");

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = (document.getElementById('username') as HTMLInputElement).value;
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;
    const tfa: boolean = (document.getElementById('2fa_checkbox') as HTMLInputElement).checked;
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, tfa }),
    });

    let data = await res.json();

    if (!res.ok || !data.jwt) {
      error.textContent = data.message || '❌ Registration failed.';
      error.classList.remove('hidden');
      return;
    }
    if (tfa) {
      const res = await fetch('/2fa/enable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.jwt}`,
        },
        body: JSON.stringify({})
      });
      const data2fa = await res.json();
      if (!res.ok) {
        error.textContent = data.message || '❌ Registration failed.';
        error.classList.remove('hidden');
        return;
      }
      const qr = data2fa.qr;
      form.classList.add('hidden');
      const tfa_container = document.getElementById('tfa_container') as HTMLFormElement;
      const jwt = data.jwt;
      tfa_container.innerHTML = `
        <label id="qrcode_label" class="">${t!.qrcode_label}</label>
        <img src="${qr}" class="rounded m-3">
        <div id="token_input" class="flex flex-row">
        <input id="2fa_token" type="numeric" placeholder="${t!.tfa_placeholder}" pattern="[0-9]{6}" maxlength="6" oninput="this.value = this.value.replace(/[^0-9]/g, '')" class=" m-2 bg-white/10 w-40 h-10 m-1 text-center rounded placeholder-gray-400 ocus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-sm">
        </div>
        <button id="token_submit" type="submit" class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg">Submit</button>
      `
      tfa_container.classList.remove("hidden");
      tfa_container.addEventListener('submit', async (e) => {
        e.preventDefault();
        const tfa_token = (document.getElementById('2fa_token') as HTMLInputElement).value;
        const res = await fetch('/2fa/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.jwt}` },
          body: JSON.stringify({tfa_token}),
        });

        const res2faverify = await res.json();
        console.log(res2faverify);
        if (!res2faverify.jwt)
        {
          console.log("not verified");
          error.textContent = res2faverify.message || "failed";
          error.classList.remove("hidden");
        } 
        else
        {
          console.log("Verified")
          saveToken(res2faverify.jwt);
          location.hash = '#/profile';
        }
      })
    }
    else
    {
      console.log(data.jwt);
      saveToken(data.jwt);
      location.hash = '#/profile';
    }
    
  });
}
