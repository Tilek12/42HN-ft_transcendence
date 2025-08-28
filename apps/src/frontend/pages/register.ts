import { renderNav } from './nav';
import { renderBackgroundFull } from '../utils/layout';
import { initLang } from './nav';
import {languageStore} from './languages';
import type {Language} from './languages';

export const translations_register_page: Record<Language, { [key: string]: string }> = {
	EN: {
		register_header: 'Create Account',
		username_label: 'Username',
		email_label: 'Email',
		password_label: 'Password',
		username_placeholder: 'Enter your username',
		email_placeholder: 'Enter your email',
		password_placeholder: 'Enter your password',
		register_btn: 'Register',
		register_error: 'Registration failed. Please check your details.',
		already_have_account: 'Already have an account?',
		sign_in: 'Sign In'
	},
	DE: {
		register_header: 'Konto erstellen',
		username_label: 'Benutzername',
		email_label: 'E-Mail',
		password_label: 'Passwort',
		username_placeholder: 'Geben Sie Ihren Benutzernamen ein',
		email_placeholder: 'Geben Sie Ihre E-Mail ein',
		password_placeholder: 'Geben Sie Ihr Passwort ein',
		register_btn: 'Registrieren',
		register_error: 'Registrierung fehlgeschlagen. Bitte überprüfen Sie Ihre Angaben.',
		already_have_account: 'Haben Sie bereits ein Konto?',
		sign_in: 'Anmelden'
	},
	GR: {
		register_header: 'Δημιουργία λογαριασμού',
		username_label: 'Όνομα χρήστη',
		email_label: 'Email',
		password_label: 'Κωδικός',
		username_placeholder: 'Εισάγετε το όνομα χρήστη σας',
		email_placeholder: 'Εισάγετε το email σας',
		password_placeholder: 'Εισάγετε τον κωδικό σας',
		register_btn: 'Εγγραφή',
		register_error: 'Η εγγραφή απέτυχε. Ελέγξτε τα στοιχεία σας.',
		already_have_account: 'Έχετε ήδη λογαριασμό;',
		sign_in: 'Σύνδεση'
	}
};

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
		const headerEl = document.getElementById('register_header');
		if (headerEl) headerEl.innerHTML = tr.register_header;
		
		const usernameLabelEl = document.getElementById('username_label');
		if (usernameLabelEl) usernameLabelEl.innerHTML = tr.username_label;
		
		const usernameInputEl = document.getElementById('username') as HTMLInputElement | null;
		if (usernameInputEl) usernameInputEl.placeholder = tr.username_placeholder;
		
		const emailLabelEl = document.getElementById('email_label');
		if (emailLabelEl) emailLabelEl.innerHTML = tr!.email_label;
		
		const emailInputEl = document.getElementById('email') as HTMLInputElement | null;
		if (emailInputEl) emailInputEl.placeholder = tr.email_placeholder;
		
		const passwordLabelEl = document.getElementById('password_label');
		if (passwordLabelEl) passwordLabelEl.innerHTML = tr.password_label;
		
		const passwordInputEl = document.getElementById('password') as HTMLInputElement | null;
		if (passwordInputEl) passwordInputEl.placeholder = tr.password_placeholder;
		
		const registerBtnEl = document.getElementById('register_btn');
		if (registerBtnEl) registerBtnEl.innerHTML = tr.register_btn;
		
		const registerErrorEl = document.getElementById('register_error');
		if (registerErrorEl) registerErrorEl.innerHTML = tr.register_error;
		
		const alreadyHaveAccountEl = document.getElementById('already_have_account');
		if (alreadyHaveAccountEl) alreadyHaveAccountEl.innerHTML = tr.already_have_account;
		
		const signInLinkEl = document.getElementById('sign_in_link');
		if (signInLinkEl) signInLinkEl.innerHTML = tr.sign_in;
		
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
