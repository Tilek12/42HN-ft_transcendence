import { renderNav, changeLoginButton } from './nav'
import { renderBackgroundFull } from '../utils/layout';
import { saveToken, enabled_2fa, clearToken } from '../utils/auth';
import { wsManager } from '../websocket/ws-manager';
import { languageStore, translations_login_page, transelate_per_id, translations_errors } from './languages';


export function renderLogin(root: HTMLElement) {
  const t = translations_login_page[languageStore.language];
  const error_trans = translations_errors[languageStore.language];
  root.innerHTML = renderBackgroundFull(`
    <div class="w-full max-w-md">
      <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 id="login_header" class="text-3xl font-bold text-white mb-2">${t.login_header}</h1>
          <p id="login_subtitle" class="text-gray-300 text-sm">${t.login_subtitle}</p>
        </div>

  
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-white/20"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span id="or_continue" class="px-4 bg-transparent text-gray-300"></span>
          </div>
        </div>

        <form id="login-form" class="space-y-6">
          <div class="space-y-1">
            <label id="username_label" for="username" class="block text-sm font-medium text-gray-200">${t.username_label}</label>
            <div class="relative">
              <input type="text" id="username" placeholder="${t.username_placeholder}"
                class="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-sm transition-all duration-300 hover:bg-white/15"
                required />
            </div>
          </div>

          <div class="space-y-1">
            <label id="password_label" for="password" class="block text-sm font-medium text-gray-200">${t.password_label}</label>
            <div class="relative">
              <input type="password" id="password" placeholder="${t.password_placeholder}"
                class="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-sm transition-all duration-300 hover:bg-white/15"
                required />
            </div>
          </div>

          <button type="submit"
            class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg">
            <span class="flex items-center justify-center space-x-2">
              <span id="sign_in_btn">${t.sign_in_btn}</span>
              <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </form>
        <form id="tfa_container"  class=" hidden flex flex-col items-center justify-center">
          <label id="tfa_label" class="text-center text-gray-300 space-x-2 ">Please enter your TOTP code from your atuhenticator</label>
          <input id="2fa_token" type="numeric" placeholder="${t!.tfa_placeholder}" pattern="[0-9]{6}" maxlength="6" oninput="this.value = this.value.replace(/[^0-9]/g, '')" class=" m-2 bg-white/10 w-40 h-10 m-1 text-center rounded placeholder-gray-400 ocus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-sm">
          <button id="token_submit" type="submit" class="w-full mt-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg">Submit</button>
        </form>
          <div id="login-error" class="hidden">
            <div
              class="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm backdrop-blur-sm">
              <div class="flex items-center space-x-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span id="error_text">${t.error_message}</span>
              </div>
            </div>
          </div>
        <div class="text-center mt-8 pt-6 border-t border-white/10">
          <p id="dont_have_account" class="text-gray-300 text-sm mb-2">${t.dont_have_account}</p>
          <a href="#/register"
            class="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200 group">
            <span id="create_account">${t.create_account}</span>
          </a>
        </div>
      </div>
    </div>
  `);
  languageStore.subscribe((lang) => {
    transelate_per_id(translations_login_page, "login_header", lang, "login_header");
    transelate_per_id(translations_login_page, "google_btn", lang, "google_btn");
    transelate_per_id(translations_login_page, "or_continue", lang, "or_continue");
    transelate_per_id(translations_login_page, "username_label", lang, "username_label");
    transelate_per_id(translations_login_page, "username_placeholder", lang, "username");
    transelate_per_id(translations_login_page, "password_label", lang, "password_label");
    transelate_per_id(translations_login_page, "password_placeholder", lang, "password");
    transelate_per_id(translations_login_page, "remember_me", lang, "remember_me");
    transelate_per_id(translations_login_page, "forgot_password", lang, "forgot_password");
    transelate_per_id(translations_login_page, "sign_in_btn", lang, "sign_in_btn");
    transelate_per_id(translations_login_page, "dont_have_account", lang, "dont_have_account");
    transelate_per_id(translations_login_page, "create_account", lang, "create_account");
    transelate_per_id(translations_errors, "error_message", lang, "error_text");
  });

  const form = document.getElementById('login-form') as HTMLFormElement;
  const errorContainer = document.getElementById('login-error')!;
  const errorText = document.getElementById('error_text')!;
  const navigation = document.getElementById('navigation');

  if (navigation)
    navigation.classList.add("hidden");

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Loading state animation
    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `
      <div class="flex items-center justify-center space-x-2">
        <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Signing in...</span>
      </div>
    `;
    submitBtn.disabled = true;

    const username = (document.getElementById('username') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const response_data = await res.json();
      if (!res.ok || !response_data.jwt) {
        let error_message = response_data.message;
        switch (error_message) {
          case 'INVALID_PASSWORD': error_message = error_trans.error_invalid_password; break;
          case 'INVALID_EMAIL': error_message = error_trans.error_invalid_email; break;
          default: 'Login failed';
        }
        errorText.textContent = error_message;
        errorContainer.classList.remove('hidden');

        // auto hiding
        setTimeout(() => {
          errorContainer.classList.add('hidden');
        }, 5000);
      } else {
        saveToken(response_data.jwt);
        if (enabled_2fa()) {
          form.classList.add('hidden');
          const tfa_container = document.getElementById('tfa_container') as HTMLFormElement;
          if (!tfa_container)
            throw new Error("no tfa_container");
          tfa_container.classList.remove('hidden');

          tfa_container.addEventListener('submit', async (e) => {
            e.preventDefault();
            const tfa_token = (document.getElementById('2fa_token') as HTMLInputElement).value;
            const button = document.getElementById('token_submit') as HTMLButtonElement;
            const res = await fetch('/2fa/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${response_data.jwt}`
              },
              body: JSON.stringify({ tfa_token }),
            });

            const res2faverify = await res.json();
            console.log(res2faverify)
            if (!res2faverify.jwt) {
              let error_message = res2faverify.message;
              switch (res2faverify.message){
              case "INVALID_USER": error_message = error_trans.error_invalid_user; break;
              case "INVALID_NO_TOKEN": error_message = error_trans.error_no_token; break;
              case "INVALID_USER_LOGGED_IN": error_message = error_trans.error_logged_in; break;
              case "INVALID_TOKEN": error_message = error_trans.error_invalid_token; break;
              default: error_message = error_trans.error_default; break;
              }
              errorText.textContent = error_message;
              errorContainer.classList.remove('hidden');

              // auto hiding
              setTimeout(() => {
                errorContainer.classList.add('hidden');
                renderLogin(root);
              }, 3000);
              return;

            } else {
              clearToken()
              saveToken(res2faverify.jwt);
              button.innerHTML = `
                <div class="flex items-center justify-center space-x-2">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Success!</span>
                </div>
                `;
              setTimeout(() => {
              location.hash = '#/profile';
              }, 1000);
              changeLoginButton(false);
            }
          })
        }
        else {
          // success animation
          submitBtn.innerHTML = `
            <div class="flex items-center justify-center space-x-2">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Success!</span>
            </div>
            `;
          setTimeout(() => {
            location.hash = '#/profile';
          }, 1000);
          changeLoginButton(false);
        }
      }
    } catch (error) {
      errorText.textContent = error as any;
      errorContainer.classList.remove('hidden');
    } finally {
      // resetting btn after delay
      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }, 2000);
    }
  });
}
