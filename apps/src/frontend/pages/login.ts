import { renderNav, changeLoginButton } from './nav.js'
import { renderBackgroundFull } from '../utils/layout.js';
import { saveToken, enabled_2fa, clearToken } from '../utils/auth.js';
import { wsManager } from '../websocket/ws-manager.js';
import { languageStore, translations_login_page, transelate_per_id, translations_errors, translations_nav } from './languages.js';
import type { Language } from '../types.js';


export function renderLogin(root: HTMLElement) {
	const t = translations_login_page[languageStore.language];
	const error_trans = translations_errors[languageStore.language];
	
	root.innerHTML = renderBackgroundFull(`
    <!-- Login Card -->
    <div class="w-full max-w-lg px-6">
      <div class="relative">
        <!-- Glow effect -->
        <div class="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur-2xl opacity-20"></div>
        
        <!-- Main card -->
        <div id="main-card" class="relative bg-gray-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ease-in-out">
          <!-- Animated gradient border -->
          <div class="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 opacity-50"></div>
          
          <div class="relative p-10 transition-all duration-500 ease-in-out" id="card-content">
            <!-- Tab Switcher -->
            <div class="flex gap-2 mb-8 p-1 bg-white/5 rounded-2xl backdrop-blur-sm">
              <button 
                id="tab-login" 
                class="flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 text-white bg-gradient-to-r from-purple-600 to-blue-600"
              >
                Login
              </button>
              <button 
                id="tab-register" 
                class="flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 text-gray-400 hover:text-white"
              >
                Sign Up
              </button>
            </div>

            <!-- Logo/Icon -->
            <div class="flex justify-center mb-8">
              <div class="relative">
                <div class="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-xl opacity-50"></div>
                <div id="form-icon" class="relative bg-gradient-to-r from-purple-500 to-blue-500 p-4 rounded-2xl transition-all duration-500">
                  <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Title -->
            <div class="text-center mb-10 transition-all duration-500" id="form-title-container">
              <h1 id="login_header" class="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-3">
                ${t.login_header}
              </h1>
              <p id="login_subtitle" class="text-gray-400">${t.login_subtitle}</p>
            </div>

            <!-- Login Form -->
            <div id="login-form-container" class="transition-all duration-500 ease-in-out">
              <form id="login-form" class="space-y-6">
                <!-- Username Input -->
                <div class="space-y-2">
                  <label id="username_label" for="username" class="block text-sm font-medium text-gray-300 ml-1">
                    ${t.username_label}
                  </label>
                  <div class="relative group">
                    <div class="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl opacity-0 group-focus-within:opacity-20 blur transition-opacity duration-300"></div>
                    <input 
                      type="text" 
                      id="username" 
                      placeholder="${t.username_placeholder}"
                      class="relative w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 px-5 py-4 rounded-xl focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300"
                      required 
                    />
                  </div>
                </div>

                <!-- Password Input -->
                <div class="space-y-2">
                  <label id="password_label" for="password" class="block text-sm font-medium text-gray-300 ml-1">
                    ${t.password_label}
                  </label>
                  <div class="relative group">
                    <div class="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl opacity-0 group-focus-within:opacity-20 blur transition-opacity duration-300"></div>
                    <input 
                      type="password" 
                      id="password" 
                      placeholder="${t.password_placeholder}"
                      class="relative w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 px-5 py-4 rounded-xl focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300"
                      required 
                    />
                  </div>
                </div>

                <!-- Submit Button -->
                <button 
                  type="submit"
                  class="relative w-full mt-8 group overflow-hidden rounded-xl"
                >
                  <div class="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 transition-transform duration-300 group-hover:scale-105"></div>
                  <div class="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span class="relative flex items-center justify-center px-6 py-4 text-white font-semibold text-lg">
                    <span id="sign_in_btn">${t.sign_in_btn}</span>
                    <svg class="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </span>
                </button>
              </form>
            </div>

            <!-- Register Form (hidden by default) -->
            <div id="register-form-container" class="hidden transition-all duration-500 ease-in-out">
              <form id="register-form" class="space-y-6">
                <!-- Username Input -->
                <div class="space-y-2">
                  <label for="reg-username" class="block text-sm font-medium text-gray-300 ml-1">
                    Username
                  </label>
                  <div class="relative group">
                    <div class="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl opacity-0 group-focus-within:opacity-20 blur transition-opacity duration-300"></div>
                    <input 
                      type="text" 
                      id="reg-username" 
                      placeholder="Choose a username"
                      class="relative w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 px-5 py-4 rounded-xl focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300"
                      required 
                    />
                  </div>
                </div>

                <!-- Email Input -->
                <div class="space-y-2">
                  <label for="reg-email" class="block text-sm font-medium text-gray-300 ml-1">
                    Email
                  </label>
                  <div class="relative group">
                    <div class="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl opacity-0 group-focus-within:opacity-20 blur transition-opacity duration-300"></div>
                    <input 
                      type="email" 
                      id="reg-email" 
                      placeholder="your@email.com"
                      class="relative w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 px-5 py-4 rounded-xl focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300"
                      required 
                    />
                  </div>
                </div>

                <!-- Password Input -->
                <div class="space-y-2">
                  <label for="reg-password" class="block text-sm font-medium text-gray-300 ml-1">
                    Password
                  </label>
                  <div class="relative group">
                    <div class="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl opacity-0 group-focus-within:opacity-20 blur transition-opacity duration-300"></div>
                    <input 
                      type="password" 
                      id="reg-password" 
                      placeholder="Create a strong password"
                      class="relative w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 px-5 py-4 rounded-xl focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300"
                      required 
                    />
                  </div>
                </div>

                <!-- Submit Button -->
                <button 
                  type="submit"
                  class="relative w-full mt-8 group overflow-hidden rounded-xl"
                >
                  <div class="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 transition-transform duration-300 group-hover:scale-105"></div>
                  <div class="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span class="relative flex items-center justify-center px-6 py-4 text-white font-semibold text-lg">
                    <span>Create Account</span>
                    <svg class="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </span>
                </button>
              </form>
            </div>

            <!-- 2FA Form -->
            <form id="tfa_container" class="hidden space-y-6">
              <div class="text-center mb-6">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-4">
                  <svg class="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <label id="tfa_label" class="block text-gray-300 text-sm">
                  Please enter your TOTP code from your authenticator
                </label>
              </div>
              <input 
                id="2fa_token" 
                type="text" 
                placeholder="${t!.tfa_placeholder}" 
                pattern="[0-9]{6}" 
                maxlength="6" 
                oninput="this.value = this.value.replace(/[^0-9]/g, '')" 
                class="w-full bg-white/5 border border-white/10 text-white text-center text-3xl tracking-[0.5em] px-5 py-4 rounded-xl focus:outline-none focus:border-purple-500/50 focus:bg-white/10 placeholder-gray-600 transition-all duration-300"
              />
              <button 
                id="token_submit" 
                type="submit" 
                class="relative w-full group overflow-hidden rounded-xl"
              >
                <div class="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600"></div>
                <span class="relative flex items-center justify-center px-6 py-4 text-white font-semibold">
                  Submit
                </span>
              </button>
            </form>

            <!-- Error Message -->
            <div id="login-error" class="hidden mt-6">
              <div class="bg-red-500/10 border border-red-500/30 text-red-300 px-5 py-4 rounded-xl backdrop-blur-sm">
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span id="error_text" class="text-sm">${t.error_message}</span>
                </div>
              </div>
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

	// Tab switching functionality
	const tabLogin = document.getElementById('tab-login') as HTMLButtonElement;
	const tabRegister = document.getElementById('tab-register') as HTMLButtonElement;
	const loginFormContainer = document.getElementById('login-form-container') as HTMLDivElement;
	const registerFormContainer = document.getElementById('register-form-container') as HTMLDivElement;
	const formIcon = document.getElementById('form-icon') as HTMLDivElement;
	const formTitleContainer = document.getElementById('form-title-container') as HTMLDivElement;
	const loginHeader = document.getElementById('login_header') as HTMLHeadingElement;
	const loginSubtitle = document.getElementById('login_subtitle') as HTMLParagraphElement;
	const mainCard = document.getElementById('main-card') as HTMLDivElement;
	const cardContent = document.getElementById('card-content') as HTMLDivElement;

	const switchToLogin = () => {
		// Update tab styles
		tabLogin.classList.add('bg-gradient-to-r', 'from-purple-600', 'to-blue-600', 'text-white');
		tabLogin.classList.remove('text-gray-400');
		tabRegister.classList.remove('bg-gradient-to-r', 'from-purple-600', 'to-blue-600', 'text-white');
		tabRegister.classList.add('text-gray-400');

		// Fade out and shrink
		registerFormContainer.style.opacity = '0';
		registerFormContainer.style.transform = 'translateX(20px)';
		formTitleContainer.style.opacity = '0';
		formIcon.style.transform = 'scale(0.8) rotate(180deg)';
		
		setTimeout(() => {
			registerFormContainer.classList.add('hidden');
			loginFormContainer.classList.remove('hidden');
			
			// Update icon with rotation
			formIcon.innerHTML = `
				<svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
				</svg>
			`;

			// Update title
			const t = translations_login_page[languageStore.language];
			loginHeader.textContent = t.login_header || "Welcome Back";
			loginSubtitle.textContent = t.login_subtitle || "Sign in to continue";
			
			// Fade in and scale back
			setTimeout(() => {
				formIcon.style.transform = 'scale(1) rotate(0deg)';
				formTitleContainer.style.opacity = '1';
				loginFormContainer.style.opacity = '1';
				loginFormContainer.style.transform = 'translateX(0)';
			}, 50);
		}, 300);
	};

	const switchToRegister = () => {
		// Update tab styles
		tabRegister.classList.add('bg-gradient-to-r', 'from-purple-600', 'to-blue-600', 'text-white');
		tabRegister.classList.remove('text-gray-400');
		tabLogin.classList.remove('bg-gradient-to-r', 'from-purple-600', 'to-blue-600', 'text-white');
		tabLogin.classList.add('text-gray-400');

		// Fade out and shrink
		loginFormContainer.style.opacity = '0';
		loginFormContainer.style.transform = 'translateX(-20px)';
		formTitleContainer.style.opacity = '0';
		formIcon.style.transform = 'scale(0.8) rotate(-180deg)';
		
		setTimeout(() => {
			loginFormContainer.classList.add('hidden');
			registerFormContainer.classList.remove('hidden');
			
			// Update icon with rotation
			formIcon.innerHTML = `
				<svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
				</svg>
			`;

			// Update title
			loginHeader.textContent = "Create Account";
			loginSubtitle.textContent = "Join us today";
			
			// Fade in and scale back
			setTimeout(() => {
				formIcon.style.transform = 'scale(1) rotate(0deg)';
				formTitleContainer.style.opacity = '1';
				registerFormContainer.style.opacity = '1';
				registerFormContainer.style.transform = 'translateX(0)';
			}, 50);
		}, 300);
	};

	// Set initial styles and transitions
	loginFormContainer.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';
	registerFormContainer.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';
	formIcon.style.transition = 'transform 0.5s ease-in-out';
	formTitleContainer.style.transition = 'opacity 0.3s ease-in-out';
	loginFormContainer.style.opacity = '1';
	loginFormContainer.style.transform = 'translateX(0)';

	tabLogin.addEventListener('click', switchToLogin);
	tabRegister.addEventListener('click', switchToRegister);

	// Translation updates
	languageStore.subscribe((lang) => {
		transelate_per_id(translations_login_page, "login_header", lang, "login_header");
		transelate_per_id(translations_login_page, "login_subtitle", lang, "login_subtitle");
		transelate_per_id(translations_login_page, "username_label", lang, "username_label");
		transelate_per_id(translations_login_page, "username_placeholder", lang, "username");
		transelate_per_id(translations_login_page, "password_label", lang, "password_label");
		transelate_per_id(translations_login_page, "password_placeholder", lang, "password");
		transelate_per_id(translations_login_page, "sign_in_btn", lang, "sign_in_btn");
		transelate_per_id(translations_login_page, "dont_have_account", lang, "dont_have_account");
		transelate_per_id(translations_login_page, "create_account", lang, "create_account");
		transelate_per_id(translations_errors, "error_message", lang, "error_text");
	});

	const form = document.getElementById('login-form') as HTMLFormElement;
	const errorContainer = document.getElementById('login-error')!;
	const errorText = document.getElementById('error_text')!;

	form.addEventListener('submit', async (e) => {
		e.preventDefault();

		const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
		const originalText = submitBtn.innerHTML;
		submitBtn.innerHTML =
			`<div class="flex items-center justify-center space-x-2">
				<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
							switch (res2faverify.message) {
								case "INVALID_USER": error_message = error_trans.error_invalid_user; break;
								case "INVALID_NO_TOKEN": error_message = error_trans.error_no_token; break;
								case "INVALID_USER_LOGGED_IN": error_message = error_trans.error_logged_in; break;
								case "INVALID_TOKEN": error_message = error_trans.error_invalid_token; break;
								default: error_message = error_trans.error_default; break;
							}
							errorText.textContent = error_message;
							errorContainer.classList.remove('hidden');

							setTimeout(() => {
								errorContainer.classList.add('hidden');
								renderLogin(root);
							}, 3000);
							return;

						} else {
							clearToken()
							saveToken(res2faverify.jwt);
							button.innerHTML = 
							`<div class="flex items-center justify-center space-x-2">
								<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
					submitBtn.innerHTML = 
					`<div class="flex items-center justify-center space-x-2">
					<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
			setTimeout(() => {
				submitBtn.innerHTML = originalText;
				submitBtn.disabled = false;
			}, 2000);
		}
	});

	// Register form handler
	const registerForm = document.getElementById('register-form') as HTMLFormElement;

	registerForm.addEventListener('submit', async (e) => {
		e.preventDefault();

		const submitBtn = registerForm.querySelector('button[type="submit"]') as HTMLButtonElement;
		const originalText = submitBtn.innerHTML;
		submitBtn.innerHTML = `
			<div class="flex items-center justify-center space-x-2">
				<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
				<span>Creating account...</span>
			</div>
		`;
		submitBtn.disabled = true;

		const username = (document.getElementById('reg-username') as HTMLInputElement).value;
		const email = (document.getElementById('reg-email') as HTMLInputElement).value;
		const password = (document.getElementById('reg-password') as HTMLInputElement).value;

		try {
			const res = await fetch('/api/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, email, password }),
			});

			const response_data = await res.json();
			
			if (!res.ok || !response_data.jwt) {
				let error_message = response_data.message || 'Registration failed';
				errorText.textContent = error_message;
				errorContainer.classList.remove('hidden');

				setTimeout(() => {
					errorContainer.classList.add('hidden');
				}, 5000);
			} else {
				saveToken(response_data.jwt);
				submitBtn.innerHTML = `
					<div class="flex items-center justify-center space-x-2">
						<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
		} catch (error) {
			errorText.textContent = 'Registration failed. Please try again.';
			errorContainer.classList.remove('hidden');
		} finally {
			setTimeout(() => {
				submitBtn.innerHTML = originalText;
				submitBtn.disabled = false;
			}, 2000);
		}
	});
}
