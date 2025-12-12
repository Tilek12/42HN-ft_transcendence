import { apiFetch, getUser } from '../utils/auth.js'
import { languageStore } from './languages.js';
import { translations_register_page, translations_settings } from './languages_i18n.js';

// DESIGN CHANGE: Added modern toast notification system with animations and gradient backgrounds
// Replaces basic alert() messages with sleek notifications
export const showToast = (message: string, type: 'success' | 'error' = 'success') => {
	const toast = document.createElement('div');
	const bgColor = type === 'success' ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600';
	const icon = type === 'success'
		? '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
		: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';

	// DESIGN: Glass-morphism toast with gradient background, auto-dismiss after 3 seconds
	toast.innerHTML = `
		<div class="fixed top-24 right-6 z-50 animate-[slideIn_0.3s_ease-out] flex items-center gap-3 bg-gradient-to-r ${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border border-white/20">
			${icon}
			<span class="font-semibold">${message}</span>
		</div>
	`;

	document.body.appendChild(toast);

	setTimeout(() => {
		toast.firstElementChild?.classList.add('animate-[slideOut_0.3s_ease-in]');
		setTimeout(() => toast.remove(), 300);
	}, 3000);
};

//----------------------Password Listeners-------------------------------
const listenerPasswordEdit = (
	password_old_check: HTMLInputElement,
	password_new: HTMLInputElement,
	password_confirm: HTMLInputElement,
	password_update_btn: HTMLButtonElement,
	password_cancel_btn: HTMLButtonElement,
	password_edit_btn: HTMLButtonElement
) => {
	password_old_check?.classList.remove('hidden');
	password_new?.classList.remove('hidden');
	password_confirm?.classList.remove('hidden');
	password_update_btn?.classList.remove('hidden');
	password_cancel_btn?.classList.remove('hidden');
	password_edit_btn?.classList.add('hidden');
}
const listenerPasswordCancel = (
	password_old_check: HTMLInputElement,
	password_new: HTMLInputElement,
	password_confirm: HTMLInputElement,
	password_update_btn: HTMLButtonElement,
	password_cancel_btn: HTMLButtonElement,
	password_edit_btn: HTMLButtonElement
) => {
	password_old_check?.classList.add('hidden');
	password_new?.classList.add('hidden');
	password_confirm?.classList.add('hidden');
	password_update_btn?.classList.add('hidden');
	password_cancel_btn?.classList.add('hidden');
	password_edit_btn?.classList.remove('hidden');
}
const listenerPasswordUpdate = async (
	password_old_check: HTMLInputElement,
	password_new: HTMLInputElement,
	password_confirm: HTMLInputElement,
	password_update_btn: HTMLButtonElement,
	password_cancel_btn: HTMLButtonElement,
	password_edit_btn: HTMLButtonElement
) => {
	let old_value = password_old_check.value;
	let new_value = password_new.value;
	let confirm_value = password_confirm.value;
	if (new_value !== confirm_value) {
		showToast(translations_settings[languageStore.language].toast_failure_pw_no_match!, 'error');
		return;
	}
	if (new_value.length < 8) {
		showToast(translations_settings[languageStore.language].toast_failure_pw_min_eight!, 'error');
		return;
	}
	if (new_value === old_value) {
		showToast(translations_settings[languageStore.language].toast_failure_pw_same!, 'error');
		return;
	}
	let res = await apiFetch('/api/private/update-password',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ oldpassword: old_value, newpassword: new_value }),
		},
	);
	let data = await res.json();
	if (!res.ok)
	{
		showToast(`${translations_settings[languageStore.language].toast_failure_pw_update!}`, 'error');
	}
	else {
		showToast(translations_settings[languageStore.language].toast_success_pw_update!, 'success');
		password_old_check.value = '';
		password_confirm.value = '';
		password_new.value = '';
	}
	
	password_old_check?.classList.add('hidden');
	password_new?.classList.add('hidden');
	password_confirm?.classList.add('hidden');
	password_update_btn?.classList.add('hidden');
	password_cancel_btn?.classList.add('hidden');
	password_edit_btn?.classList.remove('hidden');
}
//---------------------Username Listeners---------------------------------------------

const listenerUsernameCancel = (
	username_cancel_btn: HTMLButtonElement,
	username_update_btn: HTMLButtonElement,
	username_edit_btn: HTMLButtonElement,
	username_input_el: HTMLInputElement,
	username_par_el: HTMLParagraphElement

) => {
	username_cancel_btn?.classList.add('hidden');
	username_update_btn?.classList.add('hidden');
	username_input_el.classList.add('hidden');
	username_par_el.classList.remove('hidden');
	username_edit_btn?.classList.remove('hidden');
}
const listenerUsernameEdit = (
	username_cancel_btn: HTMLButtonElement,
	username_update_btn: HTMLButtonElement,
	username_edit_btn: HTMLButtonElement,
	username_input_el: HTMLInputElement,
	username_par_el: HTMLParagraphElement

) => {
	username_cancel_btn?.classList.remove('hidden');
	username_update_btn?.classList.remove('hidden');
	username_input_el.classList.remove('hidden');
	username_par_el.classList.add('hidden');
	username_edit_btn?.classList.add('hidden');
}
const listenerUsernameUpdate = async (
	username_cancel_btn: HTMLButtonElement,
	username_update_btn: HTMLButtonElement,
	username_edit_btn: HTMLButtonElement,
	username_input_el: HTMLInputElement,
	username_par_el: HTMLParagraphElement

) => {
	const new_username = username_input_el.value.trim();
	// console.log(`====> INPUT: $$${new_username}$$$`);
	// console.log(`====> username_par_el: $$${username_par_el.innerText}$$$`);

	// DESIGN CHANGE: Added regex validation with clear error message via toast
	if (!/^[a-zA-Z0-9]+$/.test(new_username)) {
		showToast(translations_settings[languageStore.language].toast_failure_username_update_for_letters_numbers!, 'error');
		return;
	}
	try {
		const res = await apiFetch('/api/private/update-username',
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ newUsername: new_username }),
			},
		)
		const data = await res.json();
		if (!res.ok) {
			showToast(translations_settings[languageStore.language].toast_failure_username_update!, 'error');
			return
		}
		showToast(`${translations_settings[`${languageStore.language}`].toast_success_username_update!}`, 'success');
		username_par_el.textContent = data.new_username;
		username_par_el.classList.remove('hidden');
		username_edit_btn.classList.remove('hidden');
		username_cancel_btn.classList.add('hidden');
		username_update_btn.classList.add('hidden');
		username_input_el.classList.add('hidden');
	} catch (e) {
		console.error(e);
			showToast(translations_settings[languageStore.language].toast_failure_username_update!, 'error');
	}
}
export { listenerPasswordEdit, listenerPasswordCancel, listenerPasswordUpdate, listenerUsernameCancel, listenerUsernameUpdate, listenerUsernameEdit };
