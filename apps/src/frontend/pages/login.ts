import { renderNav, changeLoginButton, hideNav } from './nav.js'
import { renderBackgroundFull } from '../utils/layout.js';
import { getUser } from '../utils/auth.js';
import { wsManager } from '../websocket/ws-manager.js';
import { languageStore, translations_login_page, transelate_per_id, translations_errors, translations_nav, translations_register_page } from './languages.js';
import type { Language } from '../types.js';


// DESIGN change: Unified login/register page with tab switching instead of separate pages
// - Removed floating language selector (now global in layout.ts)
// - Added tab switcher for smooth form transitions
// - Implemented card resize animations when switching forms
export function renderLogin(root: HTMLElement) {
	let login_translation = translations_login_page[languageStore.language];
	let register_translation = translations_register_page[languageStore.language];
	let error_trans = translations_errors[languageStore.language];

	root.innerHTML = renderBackgroundFull(/*html*/`
    <!-- Login Card -->
    <div class="w-full max-w-lg px-6">
      <div class="relative">
        <!-- Glow effect -->
        <div class="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur-2xl opacity-20"></div>
        
        <!-- Main card -->
        <!-- DESIGN change: Added transition-all duration-500 for smooth card resizing when switching between login/register -->
        <div id="main-card" class="relative bg-gray-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ease-in-out">
          <!-- Animated gradient border -->
          <div class="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 opacity-50"></div>
          
          <!-- DESIGN change: Card content wrapper with transition for smooth height changes -->
          <div class="relative p-10 transition-all duration-500 ease-in-out" id="card-content">
            <!-- Tab Switcher -->
            <!-- DESIGN change: Added modern tab interface for login/register switching -->
            <!-- Active tab has gradient background, inactive tab is gray with hover effect -->
            <div class="flex gap-2 mb-8 p-1 bg-white/5 rounded-2xl backdrop-blur-sm">
              <button 
                id="tab-login" 
                class="flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 text-white bg-gradient-to-r from-purple-600 to-blue-600"
              >
                ${login_translation.login_tab}
              </button>
              <button 
                id="tab-register" 
                class="flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 text-gray-400 hover:text-white"
              >
                ${register_translation.register_tab}
              </button>
            </div>

            <!-- Logo/Icon -->
            <!-- DESIGN change: Icon container with rotation/scale animation during tab switches -->
            <div id="logo" class="flex justify-center mb-8">
              <div class="relative">
                <div class="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-xl opacity-50"></div>
                <!-- DESIGN change: transition-all duration-500 for smooth icon rotation and scaling -->
                <div id="form-icon" class="relative bg-gradient-to-r from-purple-500 to-blue-500 p-4 rounded-2xl transition-all duration-500">
                  <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Login Title -->
            <!-- DESIGN change: Title container with fade transition during tab switches -->
            <div class="text-center mb-10 transition-all duration-500" id="form-title-login-container">
              <h1 id="login_header" class="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-3">
                ${login_translation.login_header}
              </h1>
              <p id="login_subtitle" class="text-gray-400">${login_translation.login_subtitle}</p>
            </div>
			<!--register Title-->
			 <div class="hidden text-center mb-10 transition-all duration-500" id="form-title-register-container">
              <h1 id="register_header" class="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-3">
                ${register_translation.register_header}
              </h1>
              <p id="register_subtitle" class="text-gray-400">${register_translation.register_subtitle}</p>
            </div>

            <!-- Login Form -->
            <div id="login-form-container" class="transition-all duration-500 ease-in-out">
              <form id="login-form" class="space-y-6">
                <!-- Username Input -->
                <div class="space-y-2">
                  <label id="username_label" for="username" class="block text-sm font-medium text-gray-300 ml-1">
                    ${login_translation.username_label}
                  </label>
                  <div class="relative group">
                    <div class="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl opacity-0 group-focus-within:opacity-20 blur transition-opacity duration-300"></div>
                    <input 
                      type="text" 
                      id="username" 
                      placeholder="${login_translation.username_placeholder}"
                      class="relative w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 px-5 py-4 rounded-xl focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300"
                      required 
                    />
                  </div>
                </div>

                <!-- Password Input -->
                <div class="space-y-2">
                  <label id="password_label" for="password" class="block text-sm font-medium text-gray-300 ml-1">
                    ${login_translation.password_label}
                  </label>
                  <div class="relative group">
                    <div class="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl opacity-0 group-focus-within:opacity-20 blur transition-opacity duration-300"></div>
                    <input 
                      type="password" 
                      id="password" 
                      placeholder="${login_translation.password_placeholder}"
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
                    <span id="sign_in_btn">${login_translation.sign_in_btn}</span>
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
                  <label for="reg-username" class="block text-sm font-medium text-gray-300 ml-1">${register_translation.username_label}</label>
                  <div class="relative group">
                    <div class="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl opacity-0 group-focus-within:opacity-20 blur transition-opacity duration-300"></div>
                    <input 
                      type="text" 
                      id="reg-username" 
                      placeholder="${register_translation.username_placeholder}"
                      class="relative w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 px-5 py-4 rounded-xl focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300"
                      required 
                    />
                  </div>
                </div>

                <!-- Password Input -->
                <div class="space-y-2">
                  <label for="reg-password" class="block text-sm font-medium text-gray-300 ml-1">
                    ${register_translation.password_label}
                  </label>
                  <div class="relative group">
                    <div class="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl opacity-0 group-focus-within:opacity-20 blur transition-opacity duration-300"></div>
                    <input 
                      type="password" 
                      id="reg-password" 
                      placeholder="${register_translation.password_placeholder}"
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
              	 	<label for="2fa_checkbox" id="2fa_checkbox_label" class="text-sm font-medium text-gray-300 cursor-pointer">
            	    ${register_translation.tfa_label}
            	    </label>
             	 </div>
                <!-- Submit Button -->
                <button id="register_button"
                  type="submit"
                  class="relative w-full mt-8 group overflow-hidden rounded-xl"
                >
                  <div class="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 transition-transform duration-300 group-hover:scale-105"></div>
                  <div class="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span class="relative flex items-center justify-center px-6 py-4 text-white font-semibold text-lg">
                    <span>${register_translation.register_btn}</span>
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
                	<label id="tfa_label" class="block text-gray-300 text-sm">${login_translation.tfa_label}</label>
				</div>
				<!-- qrcode for registration -->
				<div id="qr_container" class="hidden justify-center">
					<label id="qrcode_label" class="">${register_translation.qrcode_label}</label>
					<img id="qr_code" class="rounded-xl">
				</div>
				<!-- TOTP Input-->
              <input 
                id="2fa_token" 
                type="text" 
                placeholder="${login_translation.tfa_placeholder}" 
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
                  ${login_translation.sign_in_btn}
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
                  <span id="error_text" class="text-sm"></span>
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

	// DESIGN change: Tab switching logic with smooth animations
	// - Forms fade out with horizontal slide (±20px)
	// - Icon rotates and scales during transition
	// - Title fades out and updates
	// - Forms fade back in with coordinated timing (300ms)
	const tabLogin = document.getElementById('tab-login') as HTMLButtonElement;
	const tabRegister = document.getElementById('tab-register') as HTMLButtonElement;
	const loginFormContainer = document.getElementById('login-form-container') as HTMLDivElement;
	const registerFormContainer = document.getElementById('register-form-container') as HTMLDivElement;
	const formIcon = document.getElementById('form-icon') as HTMLDivElement;
	const formTitleLoginContainer = document.getElementById('form-title-login-container') as HTMLDivElement;
	const formTitleRegisterContainer = document.getElementById('form-title-register-container') as HTMLDivElement;
	const loginHeader = document.getElementById('login_header') as HTMLHeadingElement;
	const loginSubtitle = document.getElementById('login_subtitle') as HTMLParagraphElement;
	// const mainCard = document.getElementById('main-card') as HTMLDivElement;
	// const cardContent = document.getElementById('card-content') as HTMLDivElement;

	const switchToLogin = () => {
		// DESIGN change: Update tab button styles - active tab gets gradient background
		tabLogin.classList.add('bg-gradient-to-r', 'from-purple-600', 'to-blue-600', 'text-white');
		tabLogin.classList.remove('text-gray-400');
		tabRegister.classList.remove('bg-gradient-to-r', 'from-purple-600', 'to-blue-600', 'text-white');
		tabRegister.classList.add('text-gray-400');

		// DESIGN change: Fade out register form with slide-right and icon rotation
		registerFormContainer.style.opacity = '0';
		registerFormContainer.style.transform = 'translateX(20px)';
		formTitleLoginContainer.style.opacity = '0';
		formTitleRegisterContainer.style.opacity = '0';
		formIcon.style.transform = 'scale(0.8) rotate(180deg)';

		setTimeout(() => {
			formTitleLoginContainer.classList.remove('hidden');
			formTitleRegisterContainer.classList.add('hidden');
			registerFormContainer.classList.add('hidden');
			loginFormContainer.classList.remove('hidden');

			// DESIGN change: Switch icon to lock symbol for login
			formIcon.innerHTML = /*html*/`
				<svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
				</svg>
			`;

			// DESIGN change: Update title text for login context
			const t = translations_login_page[languageStore.language];
			loginHeader.textContent = t.login_header || "Welcome Back";
			loginSubtitle.textContent = t.login_subtitle || "Sign in to continue";

			// DESIGN change: Fade in login form with coordinated animations
			// Icon scales back to normal and rotates to 0deg, form slides in from left
			setTimeout(() => {
				formIcon.style.transform = 'scale(1) rotate(0deg)';
				formTitleLoginContainer.style.opacity = '1';
				formTitleRegisterContainer.style.opacity = '1';
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
		formTitleLoginContainer.style.opacity = '0';
		formTitleRegisterContainer.style.opacity = '0';
		formIcon.style.transform = 'scale(0.8) rotate(-180deg)';

		setTimeout(() => {
			formTitleLoginContainer.classList.add('hidden');
			formTitleRegisterContainer.classList.remove('hidden');
			loginFormContainer.classList.add('hidden');
			registerFormContainer.classList.remove('hidden');

			// Update icon with rotation
			formIcon.innerHTML = /*html*/`
				<svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
				</svg>
			`;

			// Update title
			loginHeader.textContent = register_translation.register_header!;
			loginSubtitle.textContent = register_translation.register_header!;

			// Fade in and scale back
			setTimeout(() => {
				formIcon.style.transform = 'scale(1) rotate(0deg)';
				formTitleLoginContainer.style.opacity = '1';
				formTitleRegisterContainer.style.opacity = '1';
				registerFormContainer.style.opacity = '1';
				registerFormContainer.style.transform = 'translateX(0)';
			}, 50);
		}, 300);
	};

	// DESIGN change: Set CSS transition properties for all animated elements
	// - Forms: 300ms opacity and transform transitions
	// - Icon: 500ms transform for rotation and scaling
	// - Title: 300ms opacity fade
	loginFormContainer.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';
	registerFormContainer.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';
	formIcon.style.transition = 'transform 0.5s ease-in-out';
	formTitleLoginContainer.style.transition = 'opacity 0.3s ease-in-out';
	formTitleRegisterContainer.style.transition = 'opacity 0.3s ease-in-out';
	loginFormContainer.style.opacity = '1';
	loginFormContainer.style.transform = 'translateX(0)';

	tabLogin.addEventListener('click', switchToLogin);
	tabRegister.addEventListener('click', switchToRegister);

	// Translation updates
	languageStore.subscribe((lang) => {
		// loginform

		transelate_per_id(translations_login_page, "login_tab", lang, "tab-login");
		transelate_per_id(translations_login_page, "login_header", lang, "login_header");
		transelate_per_id(translations_login_page, "login_subtitle", lang, "login_subtitle");
		transelate_per_id(translations_login_page, "username_label", lang, "username_label");
		transelate_per_id(translations_login_page, "username_placeholder", lang, "username");
		transelate_per_id(translations_login_page, "password_label", lang, "password_label");
		transelate_per_id(translations_login_page, "password_placeholder", lang, "password");
		transelate_per_id(translations_login_page, "sign_in_btn", lang, "sign_in_btn");
		transelate_per_id(translations_login_page, "dont_have_account", lang, "dont_have_account");
		transelate_per_id(translations_login_page, "create_account", lang, "create_account");
		transelate_per_id(translations_errors, "error_default", lang, "error_text");
		// registerform
		transelate_per_id(translations_register_page, "register_tab", lang, "tab-register");
		transelate_per_id(translations_register_page, "register_header", lang, "register_header");
		transelate_per_id(translations_register_page, "register_subtitle", lang, "register_subtitle");
		transelate_per_id(translations_register_page, "username_label", lang, "reg-username");
		transelate_per_id(translations_register_page, "username_placeholder", lang, "reg-username");
		transelate_per_id(translations_register_page, "password_label", lang, "reg-password");
		transelate_per_id(translations_register_page, "password_placeholder", lang, "reg-password");
		transelate_per_id(translations_register_page, "tfa_label", lang, "2fa_checkbox_label");
		transelate_per_id(translations_register_page, "register_btn", lang, "register_button");


		// 2FA form
		transelate_per_id(translations_register_page, "qrcode_label", lang, "qrcode_label");
		transelate_per_id(translations_register_page, "tfa_placeholder", lang, "2fa_token");
		// transelate_per_id(translations_register_page, "", lang, "");
		// transelate_per_id(translations_register_page, "", lang, "");
		login_translation = translations_login_page[lang];
		register_translation = translations_register_page[lang];
		error_trans = translations_errors[lang];
	});

	const form = document.getElementById('login-form') as HTMLFormElement;
	const errorContainer = document.getElementById('login-error')!;
	const errorText = document.getElementById('error_text')!;

	form.addEventListener('submit', async (e) => {
		e.preventDefault();

		const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
		const originalText = submitBtn.innerHTML;
		submitBtn.innerHTML =/*html*/
			`<div class="flex items-center justify-center space-x-2">
				<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
				<span>${login_translation.signing_in}</span>
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
				credentials: 'include',
			});

			const response_data = await res.json();
			if (!res.ok) {
				let error_message = response_data.message;
				switch (error_message) {
					case 'INVALID_PASSWORD': error_message = error_trans.error_invalid_password; break;
					default: 'Login failed';
				}
				errorText.textContent = error_message;
				errorContainer.classList.remove('hidden');

				setTimeout(() => {
					errorContainer.classList.add('hidden');
				}, 2000);
			} else {
				if (response_data.tfa) {
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
								'Cookie': `ACCESS=${response_data.jwt}` //use temp jwt from /login to validate it. Bearer needed?
							},
							body: JSON.stringify({ tfa_token: tfa_token }),
						});
						const res2faverify = await res.json();
						if (!res.ok) {
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
							button.innerHTML = /*html*/
								`<div class="flex items-center justify-center space-x-2">
								<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
								</svg>
								<span>${register_translation.success}</span>
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
					submitBtn.innerHTML = /*html*/
						`<div class="flex items-center justify-center space-x-2">
					<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
					</svg>
					<span>${register_translation.success}</span>
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
		submitBtn.innerHTML = /*html*/`
			<div class="flex items-center justify-center space-x-2">
				<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
			</div>
		`;
		submitBtn.disabled = true;

		const username = (document.getElementById('reg-username') as HTMLInputElement).value;
		const password = (document.getElementById('reg-password') as HTMLInputElement).value;
		const tfa: boolean = (document.getElementById('2fa_checkbox') as HTMLInputElement).checked;
		try {
			const res = await fetch('/api/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password, tfa }),
			});
			const response_data = await res.json();
			if (!res.ok ) {
				throw new Error(response_data.message);
			} else {
				if (tfa) {
					if (!response_data.enablejwt){
						console.log(response_data);
						throw new Error('NO_ENABLE_JWT');
					}

					const res = await fetch('/2fa/enable', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'enablejwt': `${response_data.enablejwt}`,
						},
						body: JSON.stringify({})
					});
					if (!res.ok) {
						throw new Error("2FA_ENABLE_FAILED")
					}
					const data2fa = await res.json();
					if (!data2fa.verifyjwt)
						throw new Error('NO_JWT_RECIEVED');
					if (!data2fa.qr)
						throw new Error("NO_QR_REVCEIVED");
					const qr = data2fa.qr;

					//hide all unnecessary stuff
					const tfa_container = document.getElementById('tfa_container') as HTMLFormElement;
					const qr_container = document.getElementById('qr_container');
					const qrcode_image = document.getElementById('qr_code') as HTMLImageElement;
					const tfa_label = document.getElementById('tfa_label');
					const titel = document.getElementById('form-title-register-container');

					registerForm.classList.add('hidden');
					qrcode_image.src = qr;
					titel?.classList.add('hidden');
					tfa_label?.classList.add('hidden');
					tfa_container.classList.remove('hidden');
					qr_container?.classList.remove('hidden');

					//===============verify EventHandler==============
					tfa_container.addEventListener('submit', async (e) => {
						e.preventDefault();
						const tfa_token = (document.getElementById('2fa_token') as HTMLInputElement).value;
						const res = await fetch('/2fa/verify', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								'verifyjwt': `${data2fa.verifyjwt}`,
							},
							body: JSON.stringify({ tfa_token }),
						});
						if (!res.ok)
							throw new Error("2FA_VERIFY_FAILED")
						else {
							submitBtn.innerHTML = /*html*/`
								<div class="flex items-center justify-center space-x-2">
									<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
									</svg>
									<span>${register_translation.success}</span>
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
					submitBtn.innerHTML = /*html*/`
					<div class="flex items-center justify-center space-x-2">
						<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
						</svg>
						<span>${register_translation.success}</span>
					</div>
				`;

					setTimeout(() => {
						location.hash = '#/profile';
					}, 1000);
					changeLoginButton(false);
				}
			}
		} catch (error: any) {
			if (error.message == 'USERNAME_TAKEN') {
				errorContainer.textContent = error_trans.error_username_taken!;
			}
			else if (error.message == 'DATABASE_ERROR') {
				errorContainer.textContent = error_trans.error_internal!;
			}
			else if (error.message.startsWith('body/password')) {
				errorContainer.textContent = error_trans.error_invalid_password!;
			}
			else if (error.message.startsWith('body/username')) {
				errorContainer.textContent = error_trans.error_username_min_len!;
			}
			else if (error.message == '2FA_ENABLE_FAILED') {
				errorContainer.textContent = error_trans.error_2fa_enable!;
			}
			else if (error.message == 'NO_QR_REVCEIVED') {
				errorContainer.textContent = error_trans.default!;
			}
			else if (error.message == '2FA_VERIFY_FAILED') {
				errorContainer.textContent = error_trans.error_2fa_verify!;
			}
			else {
				errorContainer.textContent = error.message;
			}
			errorContainer.classList.remove('hidden');
		} finally {
			setTimeout(() => {

				submitBtn.innerHTML = originalText;
				submitBtn.disabled = false;
			}, 2000);
		}
	});
}
