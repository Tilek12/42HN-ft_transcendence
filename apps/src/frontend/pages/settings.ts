import { Language } from '../frontendTypes.js';
import { apiFetch, fetchUser, getUser, setUser } from '../utils/auth.js';
import { defaultPicture } from '../utils/constants.js';
import { initGlobalLanguageSelector } from '../utils/globalLanguageSelector.js';
import { renderBackgroundFull } from '../utils/layout.js'
import { renderConnectionErrorPage } from './error.js';
import { languageStore, transelate_per_id } from './languages.js';
import { translations_settings, translations_login_page, translations_register_page, translations_errors } from './languages_i18n.js';
import { listenerPasswordCancel, listenerPasswordEdit, listenerPasswordUpdate, listenerUsernameCancel, listenerUsernameEdit, listenerUsernameUpdate, showToast } from './listenerUpdatePasswordAndUsername.js';
import { listenerDeletePicture, listenerUploadPicture } from './listenerUploadAndDeletePicture.js';




const update_text = (lang: Language) => {
	transelate_per_id(translations_settings, "choose", lang, "image_choose_button_header");
	transelate_per_id(translations_settings, "update", lang, "image_update_button_header");
	transelate_per_id(translations_settings, "delete", lang, "image_delete_button_header");
	transelate_per_id(translations_settings, "username", lang, "username_header");
	transelate_per_id(translations_settings, "edit", lang, "edit_username_header");
	transelate_per_id(translations_settings, "update", lang, "update_username_header");
	transelate_per_id(translations_settings, "cancel", lang, "cancel_username_header");
	transelate_per_id(translations_settings, "update", lang, "update_pass_header");
	transelate_per_id(translations_settings, "cancel", lang, "cancel_pass_header");
	transelate_per_id(translations_settings, "joined", lang, "joined_header");
	transelate_per_id(translations_settings, "security", lang, "security_header");
	transelate_per_id(translations_settings, "password", lang, "password_header");
	transelate_per_id(translations_settings, "new_password_btn", lang, "password-edit-btn");
	transelate_per_id(translations_settings, "current_password_placeholder", lang, "password-old-check");
	transelate_per_id(translations_settings, "new_password_placeholder", lang, "password-new");
	transelate_per_id(translations_settings, "confirm_new_password_placeholder", lang, "password-confirm");
	transelate_per_id(translations_settings, "profile_settings_header", lang, "profile_settings_header");


	// general 2FA
	transelate_per_id(translations_settings, "tfa_token_placeholder", lang, "tfa_enable_token_input");
	transelate_per_id(translations_settings, "tfa_token_placeholder", lang, "tfa_disable_token_input");
	transelate_per_id(translations_settings, "tfa_header", lang, "tfa_header");
	transelate_per_id(translations_settings, "cancel", lang, "tfa_enable_cancel_header");
	transelate_per_id(translations_settings, "cancel", lang, "tfa_disable_cancel_header");

	//2FA BUTTON
	transelate_per_id(translations_settings, "tfa_enable_header", lang, "tfa_enable_header"); //Button
	transelate_per_id(translations_settings, "tfa_status_enabled", lang, "tfa_status_enabled");

	transelate_per_id(translations_settings, "tfa_disable_header", lang, "tfa_disable_header");//Button
	transelate_per_id(translations_settings, "tfa_status_disabled", lang, "tfa_status_disabled");


	//2FA ENABLE CONTAINER
	transelate_per_id(translations_settings, "tfa_submit", lang, "tfa_enable_submit_header");
	transelate_per_id(translations_settings, "tfa_enable_headline", lang, "tfa_enable_container_label");

	// 2FA DISABLE CONTAINER
	transelate_per_id(translations_settings, "tfa_submit", lang, "tfa_disable_submit_header");
	transelate_per_id(translations_settings, "tfa_disable_headline", lang, "tfa_disable_container_label");
	transelate_per_id(translations_settings, "password_placeholder", lang, "tfa_password_input");


};


export async function showSettingsError(root: HTMLElement, res: Response, message?: string) {
	// const error = document.getElementById('error_header');
	let data:any;
	try{data = await res.json()}catch(e:any){};
	// if (error)
	// 	error.innerText = `${translations_errors[languageStore.language].error_default} ${res.status} ${data.message ? data.message : ''} ${message ? message : ''}`;
	showToast(`${translations_errors[languageStore.language].error_default} ${res.status} ${data.message ? data.message : ''} ${message ? message : ''}`, 'error');
	// setTimeout(() => { renderSettings(root) }, 1000)
}


export function showSettingsSuccess(root: HTMLElement,) {
	// const error = document.getElementById('error_header');
	// error?.classList.remove('text-red-600');
	// error?.classList.add('text-green-600');
	// if (error)
		// error.innerText = `${translations_register_page[languageStore.language].success}`;
	showToast(`${translations_register_page[languageStore.language].success}`);
	// console.log(`------>${translations_register_page[languageStore.language]}`)
	//  renderSettings(root);
}





export async function renderSettings(root: HTMLElement) {
	root.innerHTML = renderBackgroundFull(/*html*/`
	<div class="min-h-screen 2xl:w-2/3 lg:w-full">
			<div class="max-w m-8">
				<!-- DESIGN: 3-column responsive grid using Tailwind's 12-column system -->
				<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 ">
					
					<!-- ========== LEFT COLUMN: PROFILE INFO + SECURITY + 2FA	CHANGE ========== -->
					<!-- DESIGN: Takes 4/12 columns (33% width) -->
					<div class="lg:col-span-4 ">
					<!-- Profile Information Section -->
						<!-- Username, Email, Join Date -->
						<!-- DESIGN: Glass-morphism card with SVG icons -->
						<div class="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-black/20 transition-all duration-200 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
							<h2 class="text-2xl font-bold text-white mb-6 flex items-center">
								<svg class="w-7 h-7 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
								</svg>
								<span id="profile_settings_header"></span>
							</h2>
							
							<!-- Update Username Section -->
							<!-- DESIGN: Inline edit with show/hide toggle, border highlight on hover -->
							<div class="bg-white/5 rounded-xl p-5 mb-4 border-l-4 border-transparent hover:border-blue-500 transition-all duration-200">
								<div class="flex items-center mb-4">
									<span class="text-gray-300 text-lg font-medium mr-3" id="username_header"></span>
									<span class="text-white text-lg font-semibold" id="username"></span>
								</div>
								<input id="username-input" type="text" class="hidden w-full bg-white/20 text-white border border-black/10 rounded-lg px-4 py-3 text-base mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
								<div class="flex space-x-3">
									<button id="username-edit-btn" class="flex-1 px-5 py-3 bg-gray-600 hover:bg-gray-700 text-white text-base font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-md"><span id="edit_username_header"></span></button>
									<button id="username-update-btn" class="hidden flex-1 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-md"><span id="update_username_header"></span></button>
									<button id="username-cancel-btn" class="hidden flex-1 px-5 py-3 bg-red-600 hover:bg-red-700 text-white text-base font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-md"><span id="cancel_username_header"></span></button>
								</div>
							</div>

		
							<!-- DESIGN: Read-only fields with SVG icons and border animation on hover -->
							<div class="space-y-4">
								
								<div class="flex items-center bg-white/5 rounded-xl p-5 border-l-4 border-transparent hover:border-pink-500 transition-all duration-200">
									<svg class="w-6 h-6 mr-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
									</svg>
									<span class="text-gray-300 text-base font-medium" id="joined_header"></span>
									<span class="text-white text-base ml-3" id="created_at"></span>
								</div>
							</div>
							
						</div>

<!-- Security Settings Section -->
						<!-- Update Password functionality -->
						<!-- DESIGN: Glass-morphism card with hidden input fields that toggle on edit -->
						<div class="flex flex-col bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 mt-8 border border-black/20 transition-all duration-200 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
							<h2 class="text-2xl font-bold text-white mb-6 flex items-center">
								<svg class="w-7 h-7 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
								</svg>
								<span id="security_header"></span>
							</h2>
							<div class="space-y-4">
							<h2 class="text-xl text-white mb-2	mt-8 flex items-center">
								<span id="password_header"></span> 
								</h2>
								<input id="password-old-check" type="password" placeholder="" class="hidden w-full bg-white/20 text-white border border-black/10 rounded-xl px-5 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"/>
								<input id="password-new" type="password" placeholder="" class="hidden w-full bg-white/20 text-white border border-black/10 rounded-xl px-5 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"/>
								<input id="password-confirm" type="password" placeholder="" class="hidden w-full bg-white/20 text-white border border-black/10 rounded-xl px-5 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"/>
								<div class="flex items-center">
									<button id="password-edit-btn"   class="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white text-base font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-md"><span id="new_password_header"></span></button>
									<button id="password-update-btn" class="hidden flex-1 mr-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-md"><span id="update_pass_header"></span></button>
									<button id="password-cancel-btn" class="hidden flex-1 ml-2 px-6 py-3 bg-red-600 hover:bg-red-700   text-white text-base font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-md"><span id="cancel_pass_header"></span></button>
								</div>
							</div>
							
							<div class="flex flex-col space-y-4 mt-4">
								<h2 class="text-xl text-white mb-2 mt-8 flex items-center">
								<span id="tfa_header"></span> 
								<span id="tfa_status_enabled" class="ml-2 font-bold"></span>
								<span id="tfa_status_disabled" class="ml-2 font-bold"></span>
								</h2>
								<div class="flex w-full items-center space-y-4">
									<button id="tfa_enable_btn"  class="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-md"><span id="tfa_enable_header"></span></button>
									<button id="tfa_disable_btn" class="flex-1 px-6 py-3 bg-grey-600 hover:bg-red-700  text-white text-base font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-md"><span id="tfa_disable_header"></span></button>
								</div>
							</div>
						</div>
						
<!---LEFT COL END--></div>

					<!-- ========== RIGHT COLUMN: Profile Picture ========== -->
					<div class="lg:col-span-8">
							<!-- DESIGN: Glass-morphism card with hover shadow effect -->
						<div class="bg-white/10 items-center backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-black/20 transition-all duration-200 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
							
							<!-- Profile Picture Section -->
							<!-- Upload, update, and delete profile picture -->
							<!-- DESIGN: Large circular image (224px) with online indicator -->
							<div class="relative w-80 h-80 mx-auto mb-6 ">
								<img id="profile-pic" src="" alt="Profile" class="w-full h-full object-cover rounded-full border-4 border-white/30 shadow-xl transition-all duration-200 hover:scale-105">
								<div id="logged_in" class="absolute bottom-2 right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
							</div >
							<div id="profile_pic_update_container" class="flex justify-center items-center">
								<form id="upload-form" class="w-full flex justify-center">
									<input type="file" id="profile-pic-input" accept="image/*" class="hidden"/>
									<div class="space-y-3 w-1/2 ">
										<label for="profile-pic-input" class="">
											<span id="image_choose_button_header" class="block text-center mb-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 shadow-lg"></span>
										</label>
										<button type="submit" class="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-base font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"><span id="image_update_button_header"></span></button>
										<button type="button" id="delete-pic-btn" class="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-base font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"><span id="image_delete_button_header"></span></button>
									</div>
								</form>
							</div>
								
								<div id="tfa_enable_container" class="justify-center hidden">
						
									<form id="tfa_enable_form" >
										<h2 class="text-2xl font-bold text-white mb-6 flex items-center">
											<svg class="w-7 h-7 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
											</svg>
											<span id="tfa_enable_container_label"class=""></span>
										</h2>
										<input
										id="tfa_enable_token_input"
										type="text"
										pattern="[0-9]{6}"
										autofocus
										required
										inputmode="numeric"
										autocomplete="one-time-code"
										maxlength="6"
										class="w-1/2 bg-white/5 border border-white/10 text-white text-center text-2xl tracking-[0.5em] px-5 py-4 rounded-xl focus:outline-none focus:border-purple-500/50 focus:bg-white/10 placeholder-white-600 transition-all duration-200"
										/>
										<button id="tfa_enable_submit_btn" type="submit" class="relative w-1/2 group rounded-xl mt-2 transform hover:scale-105 transition duration-200 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:bg-gradient-to-r hover:from-purple-700 hover:via-pink-700 hover:to-blue-700">
											<span id="tfa_enable_submit_header" class="relative flex items-center justify-center px-6 py-4 text-white font-semibold"></span>
										</button>
										<button id="tfa_enable_cancel_btn"  class="relative w-1/2 group rounded-xl mt-2 bg-red-600 transform hover:scale-105 hover:bg-red-700 transition duration-200">
											<span id="tfa_enable_cancel_header"  class="relative flex items-center justify-center px-6 py-4 text-white font-semibold"></span>
										</button>
									</form>

								</div>
								<div id="tfa_disable_container" class="justify-center hidden">
									<form id="tfa_disable_form" >
										<h2  class="text-2xl font-bold text-white mb-6 flex items-center">
											<svg class="w-7 h-7 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
											</svg>
											<span id="tfa_disable_container_label"></span>
										</h2>
										<input 
										id="tfa_password_input"
										type="password" 
										autofocus 
										required
										minlength="8"
										class="w-1/2 bg-white/5 border mb-2 border-white/10 text-white text-center text-2xl tracking-[0.5em] px-5 py-4 rounded-xl focus:outline-none focus:border-purple-500/50 focus:bg-white/10 placeholder-white-600 transition-all duration-200"
										/>
										<input
										id="tfa_disable_token_input"
										type="text"
										pattern="[0-9]{6}"
										autofocus
										required
										inputmode="numeric"
										autocomplete="one-time-code"
										maxlength="6"
										class="w-1/2 bg-white/5 border border-white/10 text-white text-center text-2xl tracking-[0.5em] px-5 py-4 rounded-xl focus:outline-none focus:border-purple-500/50 focus:bg-white/10 placeholder-white-600 transition-all duration-200"
										/>
										<button id="tfa_disable_submit_btn" type="submit" class=" w-1/2 group rounded-xl mt-2 transform hover:scale-105 transition duration-200 group bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
											<span id="tfa_disable_submit_header" class="relative flex items-center justify-center px-6 py-4 text-white font-semibold"></span>
										</button>
										<button id="tfa_disable_cancel_btn"  class="relative w-1/2 group rounded-xl mt-2 bg-red-600 transform hover:scale-105 transition duration-200">
											<span id="tfa_disable_cancel_header"  class="relative flex items-center justify-center px-6 py-4 text-white font-semibold"></span>
										</button>
									</form>
									
								</div>
							
								<span id="error_header" class="relative flex items-center justify-center px-6 py-4 text-red-600 font-semibold"></span>
								
							
						</div>
					</div>
				</div>
			</div>
		</div>`);


	//===================ADD hooks to buttons======================================
	//---------------Password Related Variables------------------------------------
	const password_old_check = document.getElementById('password-old-check');
	const password_new = document.getElementById('password-new');
	const password_confirm = document.getElementById('password-confirm');
	const password_edit_btn = document.getElementById('password-edit-btn');
	const password_update_btn = document.getElementById('password-update-btn');
	const password_cancel_btn = document.getElementById('password-cancel-btn');
	//--------------Username Related Variables-------------------------------------
	const username_update_btn = document.getElementById('username-update-btn');
	const username_cancel_btn = document.getElementById('username-cancel-btn');
	const username_edit_btn = document.getElementById('username-edit-btn');

	const username_par_el = document.getElementById('username');
	const username_input_el = document.getElementById('username-input');



	if (password_edit_btn && password_old_check && password_new && password_confirm && password_edit_btn && password_update_btn && password_cancel_btn && username_update_btn && username_cancel_btn && username_edit_btn) {
		password_edit_btn.addEventListener('click', () =>
			listenerPasswordEdit(
				password_old_check as HTMLInputElement,
				password_new as HTMLInputElement,
				password_confirm as HTMLInputElement,
				password_update_btn as HTMLButtonElement,
				password_cancel_btn as HTMLButtonElement,
				password_edit_btn as HTMLButtonElement
			))
		password_cancel_btn.addEventListener('click', () =>
			listenerPasswordCancel(
				password_old_check as HTMLInputElement,
				password_new as HTMLInputElement,
				password_confirm as HTMLInputElement,
				password_update_btn as HTMLButtonElement,
				password_cancel_btn as HTMLButtonElement,
				password_edit_btn as HTMLButtonElement
			))
		password_update_btn.addEventListener('click', async () =>
			listenerPasswordUpdate(
				password_old_check as HTMLInputElement,
				password_new as HTMLInputElement,
				password_confirm as HTMLInputElement,
				password_update_btn as HTMLButtonElement,
				password_cancel_btn as HTMLButtonElement,
				password_edit_btn as HTMLButtonElement
			));
		username_update_btn.addEventListener('click', async () =>
			listenerUsernameUpdate(
				username_cancel_btn as HTMLButtonElement,
				username_update_btn as HTMLButtonElement,
				username_edit_btn as HTMLButtonElement,
				username_input_el as HTMLInputElement,
				username_par_el as HTMLInputElement
			))
		username_cancel_btn.addEventListener('click', () =>
			listenerUsernameCancel(
				username_cancel_btn as HTMLButtonElement,
				username_update_btn as HTMLButtonElement,
				username_edit_btn as HTMLButtonElement,
				username_input_el as HTMLInputElement,
				username_par_el as HTMLInputElement
			));
		username_edit_btn.addEventListener('click', () =>
			listenerUsernameEdit(
				username_cancel_btn as HTMLButtonElement,
				username_update_btn as HTMLButtonElement,
				username_edit_btn as HTMLButtonElement,
				username_input_el as HTMLInputElement,
				username_par_el as HTMLInputElement
			));

	}

	document.getElementById('upload-form')?.addEventListener
		('submit', async (e) => listenerUploadPicture(root, e));

	document.getElementById('delete-pic-btn')?.addEventListener
		('click', async (e) => listenerDeletePicture(root, e));


	// user is loaded on login as the first page liked to is profile. should be fine for now, otherwise fwtch again.
	// let user = getUser();
	// if (!user) {
	fetchUser();
	let user = getUser();
	// }
	if (user) {
		// FILL CONTENT OF USER INFORMATION
		const pic = document.getElementById('profile-pic');
		if (pic) {
			(pic as HTMLImageElement).src = user.image_blob ? `data:image/webp;base64,${user.image_blob}` : defaultPicture;
		}
		const username = document.getElementById('username');
		if (username) {
			username.innerText = user.username;
		}
		const created_at = document.getElementById('created_at');
		if (created_at) {
			created_at.innerText = `${new Date(user.created_at).toLocaleString()}`;
		}


		//everyting connected to 2FA
		const tfaEnableBtn = document.getElementById('tfa_enable_btn');
		const tfaDisableBtn = document.getElementById('tfa_disable_btn');
		const tfaStatusEnabled = document.getElementById('tfa_status_enabled');
		const tfaStatusDisabled = document.getElementById('tfa_status_disabled');


		if (tfaEnableBtn && tfaDisableBtn && tfaStatusEnabled && tfaStatusDisabled) {
			if (!user.tfa) {
				let verifyJwt: string | undefined;
				verifyJwt = undefined;
				// Enabling the 2FA
				tfaStatusEnabled.classList.add('hidden');
				tfaStatusDisabled.classList.remove('hidden');
				tfaDisableBtn.classList.add('hidden');
				tfaEnableBtn.classList.remove('hidden');
				tfaEnableBtn.addEventListener('click', async () => {
					try {

						// setup
						const picture = document.getElementById('profile-pic') as HTMLImageElement;
						picture.classList.add('hidden');
						picture.classList.remove('rounded-full')
						picture.classList.add('rounded');

						const picInput = document.getElementById('profile_pic_update_container');
						picInput?.classList.add('hidden');

						const logged_in = document.getElementById('logged_in');
						logged_in?.classList.add('hidden');

						const tfa_disable_container = document.getElementById('tfa_disable_container');
						tfa_disable_container?.classList.add('hidden');

						const tfa_enable_container = document.getElementById('tfa_enable_container');
						tfa_enable_container?.classList.remove('hidden');

						// enable request
						const res = await apiFetch('/2fa/enable', {
							method: 'POST',
							credentials: 'include'
						})
						if (!res.ok)
							showSettingsError(root, res);
						const data = await res.json();
						if (!data.verifyjwt)
							showSettingsError(root, res, 'NO_VERIFY_TOKEN');
						if (!data.qr)
							showSettingsError(root, res, 'NO_QRCODE');
						picture.src = data.qr;
						verifyJwt = data.verifyjwt;
						picture.classList.remove('hidden');
						const tfa_enable_form = document.getElementById('tfa_enable_form');
						const tokeninput = document.getElementById('tfa_enable_token_input');
						if (tokeninput)
							(tokeninput as HTMLInputElement).addEventListener('input', () => { (tokeninput as HTMLInputElement).value = (tokeninput as HTMLInputElement).value.replace(/\D/g, '') })
						// verify submit
						if (tfa_enable_form) {
							tfa_enable_form.addEventListener('submit', async (e: Event) => {
								e.preventDefault();
								const tfa_token = (document.getElementById('tfa_enable_token_input') as HTMLInputElement).value;
								const res = await apiFetch('/2fa/verify', {
									method: 'POST',
									credentials: 'include',
									headers: {
										'Content-Type': 'application/json',
										'verifyjwt': `${data.verifyjwt}`,
									},
									body: JSON.stringify({ tfa_token }),
								})
								if (!res.ok) {
									return showSettingsError(root, res);
								}
								user.tfa = true;
								setUser(user);
								showSettingsSuccess(root);
								renderSettings(root);
							});

							// cancel button
							document.getElementById('tfa_enable_cancel_btn')?.addEventListener('click', async (e) => {
								if (verifyJwt) {
									const res = await apiFetch('/2fa/cancel', {
										method: 'DELETE',
										headers: {
											'verifyjwt': `${verifyJwt}`,
										},
										credentials: 'include'
									})//dont care about response, just make sure the backend deletes the 2fa request
								}
								renderSettings(root);
							});
						}
						update_text(languageStore.language);

					} catch (e: any) {
						renderConnectionErrorPage();
					}
				})

			} else {
				//Disabling the 2FA
				tfaStatusDisabled.classList.add('hidden');
				tfaEnableBtn.classList.add('hidden');
				tfaDisableBtn.classList.remove('hidden');
				tfaStatusEnabled.classList.remove('hidden');
				tfaDisableBtn.addEventListener('click', async () => {
					const picture = document.getElementById('profile-pic') as HTMLImageElement;
					picture.classList.add('hidden');

					const picInput = document.getElementById('profile_pic_update_container');
					picInput?.classList.add('hidden');

					const logged_in = document.getElementById('logged_in');
					logged_in?.classList.add('hidden');

					const tfa_enable_container = document.getElementById('tfa_enable_container');
					tfa_enable_container?.classList.add('hidden');

					const tfa_disable_container = document.getElementById('tfa_disable_container');
					tfa_disable_container?.classList.remove('hidden');

					const tfa_disable_form = document.getElementById('tfa_disable_form');
					if (tfa_disable_form) {
						tfa_disable_form.addEventListener('submit', async (e: Event) => {
							e.preventDefault();
							try {
								const tfa_token = (document.getElementById('tfa_disable_token_input') as HTMLInputElement).value;
								const password = (document.getElementById('tfa_password_input') as HTMLInputElement).value;
								const res = await apiFetch('/2fa/disable', {
									method: 'POST',
									credentials: 'include',
									body: JSON.stringify({ password, tfa_token }),
									headers: { 'Content-Type': 'application/json' },
								})
								if (res.ok) {
									user.tfa = false;
									setUser(user);
									showSettingsSuccess(root);
								}
								else {
									showSettingsError(root, res);
								}
								renderSettings(root);
							} catch (e: any) {
								renderConnectionErrorPage();
							}
						});
					}
					renderSettings(root);
				});
			}

		}

	}
	document.getElementById('nav_settings')?.addEventListener('click', () => { renderSettings(root) });
	update_text(languageStore.language);
	languageStore.subscribe((lang: Language) => update_text(lang))
	initGlobalLanguageSelector();
	
}
