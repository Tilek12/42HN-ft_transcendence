
import { renderBackgroundFull } from '../utils/layout.js';
import { languageStore, transelate_per_id } from './languages.js';
import { translations_register_page, translations_errors } from './languages_i18n.js';
import type { Language } from '../frontendTypes.js';


export function renderRegister(root: HTMLElement) {
  // DESIGN change: Note - This standalone register page now has a duplicate language selector.
  // The preferred UX is the tab-based login/register in login.ts with the global floating language toggle.
  // This page remains as fallback if accessed directly via #/register route.
  
  const t = translations_register_page[languageStore.language];
  root.innerHTML = renderBackgroundFull(/*html*/`
    <!-- DESIGN change: Local language selector (redundant with global floating toggle, but kept for standalone access) -->
    <!-- Floating Language Selector -->
    <div class="fixed bottom-8 right-8 z-50">
      <div class="relative">
        <button id="lang-toggle" class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-md border border-white/30 rounded-full text-white hover:border-white/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
          </svg>
          <span id="current-lang" class="font-medium text-sm">EN</span>
          <svg class="w-4 h-4 transition-transform duration-300" id="lang-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        <div id="lang-dropdown" class="hidden absolute bottom-full right-0 mb-3 w-48 bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          <button data-lang="EN" class="lang-option w-full px-4 py-3 text-white hover:bg-white/10 transition-colors duration-200 text-left flex items-center gap-3">
            <span class="text-xl">🇬🇧</span>
            <span>English</span>
          </button>
          <button data-lang="DE" class="lang-option w-full px-4 py-3 text-white hover:bg-white/10 transition-colors duration-200 text-left flex items-center gap-3 border-t border-white/10">
            <span class="text-xl">🇩🇪</span>
            <span>Deutsch</span>
          </button>
          <button data-lang="GR" class="lang-option w-full px-4 py-3 text-white hover:bg-white/10 transition-colors duration-200 text-left flex items-center gap-3 border-t border-white/10">
            <span class="text-xl">🇬🇷</span>
            <span>Ελληνικά</span>
          </button>
        </div>
      </div>
    </div>

    <div class="w-full max-w-lg px-6">
      <div class="relative">
        <!-- Glow effect -->
        <div class="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur-2xl opacity-20"></div>
        
        <!-- Main card -->
        <div class="relative bg-gray-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <!-- Animated gradient border -->
          <div class="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 opacity-50"></div>
          
          <div class="relative p-10">
            <!-- Logo/Icon -->
            <div class="flex justify-center mb-8">
              <div class="relative">
                <div class="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-xl opacity-50"></div>
                <div class="relative bg-gradient-to-r from-purple-500 to-blue-500 p-4 rounded-2xl">
                  <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Title -->
            <div class="text-center mb-10">
              <h1 id="register_header" class="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-3">
                ${t!.register_header}
              </h1>
            </div>

            <!-- Register Form -->
            <form id="register_form" class="space-y-6">
              <!-- Username Input -->
              <div class="space-y-2">
                <label id="username_label" for="username" class="block text-sm font-medium text-gray-300 ml-1">
                  ${t!.username_label}
                </label>
                <div class="relative group">
                  <div class="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl opacity-0 group-focus-within:opacity-20 blur transition-opacity duration-300"></div>
                  <input 
                    type="text" 
                    id="username" 
                    placeholder="${t!.username_placeholder}"
                    class="relative w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 px-5 py-4 rounded-xl focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300"
                    required 
                  />
                </div>
              </div>

              <!-- Email Input -->
              <div class="space-y-2">
                <label id="email_label" for="email" class="block text-sm font-medium text-gray-300 ml-1">
                  ${t!.email_label}
                </label>
                <div class="relative group">
                  <div class="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl opacity-0 group-focus-within:opacity-20 blur transition-opacity duration-300"></div>
                  <input 
                    type="email" 
                    id="email" 
                    placeholder="${t!.email_placeholder}"
                    class="relative w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 px-5 py-4 rounded-xl focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300"
                    required 
                  />
                </div>
              </div>

              <!-- Password Input -->
              <div class="space-y-2">
                <label id="password_label" for="password" class="block text-sm font-medium text-gray-300 ml-1">
                  ${t!.password_label}
                </label>
                <div class="relative group">
                  <div class="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl opacity-0 group-focus-within:opacity-20 blur transition-opacity duration-300"></div>
                  <input 
                    type="password" 
                    id="password" 
                    placeholder="${t!.password_placeholder}"
                    class="relative w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 px-5 py-4 rounded-xl focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300"
                    required 
                  />
                </div>
              </div>

              <!-- 2FA Checkbox -->
              <div class="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <input 
                  id="2fa_checkbox" 
                  type="checkbox" 
                  class="w-5 h-5 rounded border-2 border-white/30 bg-white/10 text-purple-500 focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-0 cursor-pointer transition-all duration-300" 
                />
                <label for="2fa_checkbox" class="text-sm font-medium text-gray-300 cursor-pointer">
                  ${t!.tfa_label}
                </label>
              </div>

              <!-- Submit Button -->
              <button 
                type="submit"
                id="register_btn"
                class="relative w-full mt-8 group overflow-hidden rounded-xl"
              >
                <div class="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 transition-transform duration-300 group-hover:scale-105"></div>
                <div class="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span class="relative flex items-center justify-center px-6 py-4 text-white font-semibold text-lg">
                  ${t!.register_btn}
                  <svg class="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </span>
              </button>

              <!-- Error Message -->
              <p id="register_error" class="hidden mt-4 bg-red-500/10 border border-red-500/30 text-red-300 px-5 py-4 rounded-xl backdrop-blur-sm text-sm"></p>
            </form>

            <!-- 2FA Container -->
            <form id="tfa_container" class="hidden"></form>

            <!-- Divider -->
            <div class="relative my-8">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-white/10"></div>
              </div>
            </div>

            <!-- Sign in link -->
            <div class="text-center">
              <p id="already_have_account" class="text-gray-400 text-sm mb-3">
                ${t!.already_have_account}
              </p>
              <a 
                id="sign_in_link"
                href="#/login"
                class="inline-flex items-center gap-2 text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text font-semibold hover:from-purple-300 hover:to-blue-300 transition-all duration-300 group"
              >
                ${t!.sign_in}
                <svg class="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-all duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `);

  // Hide navigation
  const navigation = document.getElementById('navigation');
  if (navigation)
    navigation.classList.add("hidden");

  // Language toggle functionality
  const langToggle = document.getElementById('lang-toggle') as HTMLButtonElement;
  const langDropdown = document.getElementById('lang-dropdown') as HTMLDivElement;
  const langOptions = document.querySelectorAll('.lang-option');
  const currentLangSpan = document.getElementById('current-lang') as HTMLSpanElement;
  const langArrow = document.getElementById('lang-arrow') as HTMLElement | null;

  langToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = langDropdown.classList.contains('hidden');
    langDropdown.classList.toggle('hidden');
    if (langArrow) {
      langArrow.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
    }
  });

  document.addEventListener('click', () => {
    langDropdown.classList.add('hidden');
    if (langArrow) {
      langArrow.style.transform = 'rotate(0deg)';
    }
  });

  langOptions.forEach(option => {
    option.addEventListener('click', (e) => {
      const lang = (e.currentTarget as HTMLButtonElement).dataset.lang;
      if (lang) {
        languageStore.language = lang as Language;
        if (currentLangSpan) {
          currentLangSpan.textContent = lang;
        }
        langDropdown.classList.add('hidden');
        if (langArrow) {
          langArrow.style.transform = 'rotate(0deg)';
        }
      }
    });
  });

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
    if (currentLangSpan) {
      currentLangSpan.textContent = lang;
    }
  });

  const form = document.getElementById('register_form') as HTMLFormElement;
  const error = document.getElementById('register_error')!;

	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		const error_translation = translations_errors[languageStore.language];
		const username = (document.getElementById('username') as HTMLInputElement).value;
		const password = (document.getElementById('password') as HTMLInputElement).value;
		const tfa: boolean = (document.getElementById('2fa_checkbox') as HTMLInputElement).checked;
		const res = await fetch('/api/register', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password, tfa }),
		});

		let data = await res.json();

		if (!res.ok) {
			if (data.message == 'USERNAME_TAKEN') {
				error.textContent = error_translation.error_username_taken || '❌ Registration failed.';
			}
			else if (data.message.startsWith('body/password')) {
				error.textContent = error_translation.error_invalid_password || '❌ Registration failed.';
			}
			else if (data.message.startsWith('body/username')) {
				error.textContent = error_translation.error_username_min_len || '❌ Registration failed.';
			}
			else {
				error.textContent = data.message || '❌ Registration failed.';
			}
			error.classList.remove('hidden');
			setTimeout(() => { error.classList.add('hidden') }, 5000);
			return;
		}
		if (tfa) {
			const res = await fetch('/2fa/enable', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'token': data.jwt,
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
			tfa_container.innerHTML =
			/*html*/`
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
						'cookie': `Access=${data.jwt}`
					},
					body: JSON.stringify({ tfa_token }),
				});

				const res2faverify = await res.json();
				console.log(res2faverify);
				if (!res2faverify.jwt) {
					console.log("not verified");
					error.textContent = res2faverify.message || "failed";
					error.classList.remove("hidden");
				}
				else {
					console.log("Verified")
					location.hash = '#/profile';
				}
			})
		}
		else {
			location.hash = '#/profile';
		}

	});
}
