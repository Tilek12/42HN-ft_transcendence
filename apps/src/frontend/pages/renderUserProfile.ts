import { renderBackgroundFull } from '../utils/layout.js';
import { wsManager } from '../websocket/ws-manager.js';
import type { Language, User } from '../types.js';
import { defaultPicture } from '../utils/constants.js';
import { languageStore, translations_profile, transelate_per_id } from './languages.js'

export type Profile_details = {
	backend_url?: string;
	data_async: any;
	profile_pic_id: string;
	logged_in_id: string;
	username_id: string;
	email_id: string;
	wins_id: string;
	losses_id: string;
	trophies_id: string;
	created_at_id: string;
};

let lastPresence: string[] | undefined = [];



export const profile_ids = (user: User) => {

	let username 	= document.getElementById('username');
	let wins 		= document.getElementById('wins');
	let losses 		= document.getElementById('losses');
	let trophies 	= document.getElementById('trophies');
	let created_at 	= document.getElementById('created_at');
	let profile_pic = document.getElementById('profile_pic') as HTMLImageElement;

	if (username && wins && losses && trophies && created_at && profile_pic) {
		// function render() {
		// 	const listUsers: User[] | undefined = wsManager.presenceUserList.map((u) => u.name);
		// 	let logged_in = document.getElementById();
		// 	if (logged_in) {
		// 		if (JSON.stringify(listUsers) !== JSON.stringify(lastPresence)) {
		// 			lastPresence = [...listUsers];
		// 			// logged_in.innerHTML = ` ${listUsers.includes(profile.data_async.user.username) ? 'yes' : 'no'}`;
		// 		}
		// 	}
		// 	// setTimeout(render, 500);
		// 	// console.log("LAST PRESENCEEEEEE++>>", lastPresence);
		// }
		// render();
		username.innerText = ` ${user.username}`;
		wins.innerText = ` ${user.wins}`;
		losses.innerText = ` ${user.losses}`;
		trophies.innerText = ` ${user.trophies}`;
		created_at.innerText = ` ${new Date(user.created_at).toLocaleString()}`;

		profile_pic.src = user.image_blob ? `data:image/webp;base64,${user.image_blob}` : defaultPicture;

	}
};

export const update_langauge_headers_user_profile = (lang: Language = 'EN') => {
	// const your_header_profile = document.getElementById("your_profile_header") as HTMLHeadElement;
	transelate_per_id(translations_profile, "your_profile", lang, "your_profile_header");
	transelate_per_id(translations_profile, "update", lang, "image_update_button_header");
	transelate_per_id(translations_profile, "delete", lang, "image_delete_button_header");
	transelate_per_id(translations_profile, "username", lang, "username_header");
	transelate_per_id(translations_profile, "edit", lang, "edit_username_header");
	transelate_per_id(translations_profile, "update", lang, "update_username_header");
	transelate_per_id(translations_profile, "cancel", lang, "cancel_username_header");
	transelate_per_id(translations_profile, "email", lang, "email_header");
	transelate_per_id(translations_profile, "wins", lang, "wins_header");
	transelate_per_id(translations_profile, "losses", lang, "losses_header");
	transelate_per_id(translations_profile, "trophies", lang, "trophies_header");
	transelate_per_id(translations_profile, "joined", lang, "joined_header");
	transelate_per_id(translations_profile, "update", lang, "update_pass_header");
	transelate_per_id(translations_profile, "cancel", lang, "cancel_pass_header");
	transelate_per_id(translations_profile, "match_history", lang, "match_history_header");
	transelate_per_id(translations_profile, "new_password_btn", lang, "password-edit-btn");
	transelate_per_id(translations_profile, "load_more", lang, "load_more_header");
	transelate_per_id(translations_profile, "logout", lang, "logout_header");
	transelate_per_id(translations_profile, "current_password_placeholder", lang, "password-old-check");
	transelate_per_id(translations_profile, "new_password_placeholder", lang, "password-new");
	transelate_per_id(translations_profile, "confirm_new_password_placeholder", lang, "password-confirm");
}
export function renderUserProfile(data: any, lang = 'EN')
{
	// const select = document.getElementById('language-select') as HTMLSelectElement; 
	// const lang = select.value;
	// console.log("inside of renderer=========================", data);
	// I can have an obj with keyes the language value
	// let new_value = document.getElementById('language-select').value;
	// let old_value_of_language = 'DE';
	// console.log(new_value);
	// if(new_value !== old_value_of_language)
	// 	console.log('!!!!!!!!!!!!!!!!!!!!yes');
	// update_langauge_headers_user_profile(lang);
	
	// DESIGN CHANGE: Complete 3-column layout redesign with glass-morphism and larger sizing
	// - Changed from compact layout to full-screen (95% width)
	// - Added pt-24 for header spacing
	// - Implemented 3-column grid: Profile (3/12) | Info (5/12) | History (4/12)
	// - All sections use glass-morphism (bg-white/10 + backdrop-blur-md)
	// - Increased all sizes: profile pic (224px), fonts (text-base to text-4xl), padding (p-8)
	// - Added hover animations (scale-105) and enhanced shadows
	let res : string = renderBackgroundFull(
		/*html*/
		`
		<div class="min-h-screen">
			<div class="max-w m-8">
				<!-- DESIGN: 3-column responsive grid using Tailwind's 12-column system -->
				<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 ">
					
					<!-- ========== LEFT COLUMN: Profile Picture + Stats + Logout ========== -->
					<!-- DESIGN: Takes 3/12 columns (25% width) -->
					<div class="lg:col-span-3 ">
						<!-- DESIGN: Glass-morphism card with hover shadow effect -->
						<div class="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
							
							<!-- Profile Picture Section -->
							<!-- Upload, update, and delete profile picture -->
							<!-- DESIGN: Large circular image (224px) with online indicator -->
							<form id="upload-form" class="mb-8">
								<div class="relative w-56 h-56 mx-auto mb-6">
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

							<!-- Stats Section -->
							<!-- Wins, Losses, Trophies display -->
							<!-- DESIGN: Color-coded stats (green/red/yellow) with large numbers (text-4xl) -->
							<div class="grid grid-cols-3 gap-4 mb-8">
								<div class="bg-green-500/20 rounded-xl p-5 text-center transition-all duration-300 hover:scale-105 hover:bg-green-500/30">
									<div class="text-4xl font-bold text-green-400" id="wins"></div>
									<div class="text-sm text-gray-300 mt-2" id="wins_header"></div>
								</div>
								<div class="bg-red-500/20 rounded-xl p-5 text-center transition-all duration-300 hover:scale-105 hover:bg-red-500/30">
									<div class="text-4xl font-bold text-red-400" id="losses"></div>
									<div class="text-sm text-gray-300 mt-2" id="losses_header"></div>
								</div>
								<div class="bg-yellow-500/20 rounded-xl p-5 text-center transition-all duration-300 hover:scale-105 hover:bg-yellow-500/30">
									<div class="text-4xl font-bold text-yellow-400" id="trophies"></div>
									<div class="text-sm text-gray-300 mt-2" id="trophies_header"></div>
								</div>
							</div>

							<!-- Logout Button Section -->
							<!-- DESIGN: Gradient button (red) with hover scale effect -->
							
						</div>
					</div>

					<!-- ========== MIDDLE COLUMN: Profile Info + Security ========== -->
					<!-- DESIGN: Takes 5/12 columns (42% width) - largest column for main content -->
					<div class="lg:col-span-5 space-y-8">
						
						<!-- Profile Information Section -->
						<!-- Username, Email, Join Date -->
						<!-- DESIGN: Glass-morphism card with SVG icons -->
						<div class="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
							<h2 class="text-2xl font-bold text-white mb-6 flex items-center">
								<svg class="w-7 h-7 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
								</svg>
								Profile Info
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

							<!-- Email & Join Date Display Section -->
							<!-- DESIGN: Read-only fields with SVG icons and border animation on hover -->
							<div class="space-y-4">
								<!--div class="flex items-center bg-white/5 rounded-xl p-5 border-l-4 border-transparent hover:border-purple-500 transition-all duration-300">
									<svg class="w-6 h-6 mr-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
									</svg>
									<span class="text-gray-300 text-base font-medium" id="email_header"></span>
									<span class="text-white text-base ml-3" id="email"></span>
								</div-->
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
						<div class="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
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

					<!-- ========== RIGHT COLUMN: Match History + Users List ========== -->
					<!-- DESIGN: Takes 4/12 columns (33% width) - scrollable sections -->
					<div class="lg:col-span-4 space-y-8">
						
						<!-- Match History Section -->
						<!-- Scrollable list of past matches -->
						<!-- DESIGN: Sticky header, max-height 350px with scroll, populated by profile.ts -->
						<div class="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
							<h2 class="text-2xl font-bold text-white mb-6 flex items-center sticky top-0 bg-white/10 backdrop-blur-md pb-4 -mt-2">
								<svg class="w-7 h-7 mr-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
								</svg>
								<span id="match_history_header"></span>
							</h2>
							<!-- DESIGN: Scrollable container with custom scrollbar styling -->
							<div id="match-history" class="max-h-[350px] overflow-y-auto pr-2"></div>
						</div>

						<!-- Users List Section -->
						<!-- Load more users functionality -->
						<!-- DESIGN: Scrollable list (320px) with gradient "Load More" button -->
						<div class="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
							<!-- DESIGN: User profiles populated by renderProfiles.ts -->
							<div id="profiles-list" class="max-h-[320px] overflow-y-auto pr-2 mb-5"></div>
							<!-- DESIGN: Multi-color gradient button (blue-purple-pink) -->
							<button id="more-profiles-btn" class="w-full px-6 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-2xl">
								<span id="load_more_header"></span>
							</button>
						</div>
					</div>
				</div>
			</div>
        </div>`)
		// requestAnimationFrame(()=>renderUserProfile(backend_url,data));
	// END OF DESIGN CHANGES - Summary:
	// Layout: 3-column grid (3-5-4 ratio) replacing previous compact design
	// Sizing: Increased from small to large (profile: 224px, fonts: up to text-4xl, padding: p-8)
	// Visual: Glass-morphism theme with backdrop-blur-md, semi-transparent backgrounds
	// Interactive: Hover animations (scale-105), gradient buttons, color-coded stats
	// Spacing: pt-24 added to prevent header overlap, gap-8 between columns
	// Scrolling: Match history (350px) and users list (320px) are scrollable
	return res;
}