import { Language } from '../types.js';
import { getUser } from '../utils/auth.js';
import { defaultPicture } from '../utils/constants.js';
import { renderBackgroundFull } from '../utils/layout.js'
import { languageStore, transelate_per_id, translations_settings } from './languages.js';
import { listenerPasswordCancel, listenerPasswordEdit, listenerPasswordUpdate, listenerUsernameCancel, listenerUsernameEdit, listenerUsernameUpdate } from './listenerUpdatePasswordAndUsername.js';




const update_text = (lang:Language)=>{
	transelate_per_id(translations_settings, "update", lang, "image_update_button_header");
	transelate_per_id(translations_settings, "delete", lang, "image_delete_button_header");
	transelate_per_id(translations_settings, "username", lang, "username_header");
	transelate_per_id(translations_settings, "edit", lang, "edit_username_header");
	transelate_per_id(translations_settings, "update", lang, "update_username_header");
	transelate_per_id(translations_settings, "cancel", lang, "cancel_username_header");
	transelate_per_id(translations_settings, "update", lang, "update_pass_header");
	transelate_per_id(translations_settings, "cancel", lang, "cancel_pass_header");
	transelate_per_id(translations_settings, "joined", lang, "joined_header");
	transelate_per_id(translations_settings, "new_password_btn", lang, "password-edit-btn");
	transelate_per_id(translations_settings, "current_password_placeholder", lang, "password-old-check");
	transelate_per_id(translations_settings, "new_password_placeholder", lang, "password-new");
	transelate_per_id(translations_settings, "confirm_new_password_placeholder", lang, "password-confirm");
	transelate_per_id(translations_settings, "profile_settings_header", lang, "profile_settings_header");
};







export async function renderSettings(root: HTMLElement) {
	root.innerHTML = renderBackgroundFull(/*html*/`
  <div class="min-h-screen lg:w-2/3">
			<div class="max-w m-8">
				<!-- DESIGN: 3-column responsive grid using Tailwind's 12-column system -->
				<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 ">
					
					<!-- ========== LEFT COLUMN: PROFILE INFO + SECURITY + 2FA  CHANGE ========== -->
					<!-- DESIGN: Takes 4/12 columns (33% width) -->
					<div class="lg:col-span-4 ">
					<!-- Profile Information Section -->
						<!-- Username, Email, Join Date -->
						<!-- DESIGN: Glass-morphism card with SVG icons -->
						<div class="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
							<h2 class="text-2xl font-bold text-white mb-6 flex items-center">
								<svg class="w-7 h-7 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
								</svg>
								<span id="profile_settings_header"></span>
							</h2>
							
							<!-- Update Username Section -->
							<!-- DESIGN: Inline edit with show/hide toggle, border highlight on hover -->
							<div class="bg-white/5 rounded-xl p-5 mb-4 border-l-4 border-transparent hover:border-blue-500 transition-all duration-300">
								<div class="flex items-center mb-4">
									<span class="text-gray-300 text-lg font-medium mr-3" id="username_header"></span>
									<span class="text-white text-lg font-semibold" id="username"></span>
								</div>
								<input id="username-input" type="text" class="hidden w-full bg-white/20 text-white border border-white/30 rounded-lg px-4 py-3 text-base mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
								<div class="flex space-x-3">
									<button id="username-edit-btn" class="flex-1 px-5 py-3 bg-gray-600 hover:bg-gray-700 text-white text-base font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-md"><span id="edit_username_header"></span></button>
									<button id="username-update-btn" class="hidden flex-1 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-md"><span id="update_username_header"></span></button>
									<button id="username-cancel-btn" class="hidden flex-1 px-5 py-3 bg-red-600 hover:bg-red-700 text-white text-base font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-md"><span id="cancel_username_header"></span></button>
								</div>
							</div>

		
							<!-- DESIGN: Read-only fields with SVG icons and border animation on hover -->
							<div class="space-y-4">
								
								<div class="flex items-center bg-white/5 rounded-xl p-5 border-l-4 border-transparent hover:border-pink-500 transition-all duration-300">
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
						<div class="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 mt-8 border border-white/20 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
							<h2 class="text-2xl font-bold text-white mb-6 flex items-center">
								<svg class="w-7 h-7 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
								</svg>
								Security
							</h2>
							<div class="space-y-4">
								<input id="password-old-check" type="password" placeholder="" class="hidden w-full bg-white/20 text-white border border-white/30 rounded-xl px-5 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"/>
								<input id="password-new" type="password" placeholder="" class="hidden w-full bg-white/20 text-white border border-white/30 rounded-xl px-5 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"/>
								<input id="password-confirm" type="password" placeholder="" class="hidden w-full bg-white/20 text-white border border-white/30 rounded-xl px-5 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"/>
								<div class="flex space-x-3">
									<button id="password-edit-btn" class="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white text-base font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-md"><span id="new_password_btn"></span></button>
									<button id="password-update-btn" class="hidden flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-md"><span id="update_pass_header"></span></button>
									<button id="password-cancel-btn" class="hidden flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-base font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-md"><span id="cancel_pass_header"></span></button>
								</div>
							</div>
						</div>
					</div>

					<!-- ========== RIGHT COLUMN: Profile Picture ========== -->
					<div class="lg:col-span-8">
							<!-- DESIGN: Glass-morphism card with hover shadow effect -->
						<div class="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
							
							<!-- Profile Picture Section -->
							<!-- Upload, update, and delete profile picture -->
							<!-- DESIGN: Large circular image (224px) with online indicator -->
							<form id="upload-form" class="mb-8 w-full">
								<div class="relative w-80 h-80 mx-auto mb-6">
									<img id="profile_pic" src="" alt="Profile" class="w-full h-full object-cover rounded-full border-4 border-white/30 shadow-xl transition-all duration-300 hover:scale-105">
									<div id="logged_in" class="absolute bottom-2 right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
								</div>
								<input type="file" id="profile-pic-input" accept="image/*" class="hidden"/>
								<div class="space-y-3">
									<label for="profile-pic-input" class="block">
										<span id="image_update_button_header" class="block text-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 shadow-lg">Choose</span>
									</label>
									<button type="submit" class="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-base font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg">Upload</button>
									<button type="button" id="delete-pic-btn" class="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-base font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"><span id="image_delete_button_header">Delete</span></button>
								</div>
							</form>
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

	// user is loaded on login as the first page liked to is profile. should be fine for now, otherwise fwtch again.
	let user = getUser();
	if (!user)
	{
		alert("Oh no, no user found!");
		location.hash = '/profile';
	}
	else{

		const pic = document.getElementById('profile-pic');
		if (pic){
			(pic as HTMLImageElement).src = user.image_blob ? `data:image/webp;base64,${user.image_blob}` : defaultPicture;
		}
		const username = document.getElementById('username');
		if (username){
			username.innerText = user.username;
		}
		const created_at = document.getElementById('created_at');
		if (created_at){
			created_at.innerText = `${new Date(user.created_at).toLocaleString()}`;
		}
		// const username = document.getElementById('username');
		// const username = document.getElementById('username');
		// const username = document.getElementById('username');
		// const username = document.getElementById('username');
		// const username = document.getElementById('username');
		
	}
	
	document.getElementById('nav_settings')?.addEventListener('click', () => { renderSettings(root) });
	update_text(languageStore.language);
}
