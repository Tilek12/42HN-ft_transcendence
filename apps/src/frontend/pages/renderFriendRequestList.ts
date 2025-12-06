
import { fProfile } from '../frontendTypes.js';
import { apiFetch, getUser } from '../utils/auth.js'
import { defaultPicture } from '../utils/constants.js';
import { wsManager } from '../websocket/ws-manager.js';
import { languageStore, translations_errors, translations_profile } from './languages.js';
import { showError } from './renderProfiles.js';



export async function renderFriendRequestsList() {

	const container = document.getElementById('friend-requests-list');
	if (!container) return;
	try {
		const res = await apiFetch('/api/private/friendrequests', {
			method: 'GET',
			credentials: 'include'
		});

		const data = await res.json();
		if (!res.ok)
			return showError('friend_requests_error', res);

		const requests: fProfile[] = data.requestProfiles;
		if (!requests)
			showError('friend_requests_error', undefined, "NO requestProfiles received");
		console.log(requests);
		if (requests.length > 0) {
			let content: string[] = [];
			requests.forEach((profile: fProfile) => {

			let is_connected =wsManager.presenceUserList.map((u) => u.name).includes(profile.username);
			
			const profile_pic_src = profile.image_blob ? `data:image/webp;base64,${profile.image_blob}` : defaultPicture;

				content.push  (/*html*/`
			
						<div class="flex items-center justify-between bg-white/10 backdrop-blur-md p-5 rounded-xl shadow-xl mb-4 border border-white/20 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:bg-white/15 hover:border-blue-400/50 group">
							<div class="flex items-center space-x-4">

								<div class="relative">
									<img src="${profile_pic_src}" class="w-16 h-16 rounded-full border-4 border-white/30 shadow-lg object-cover transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:border-blue-400" />
									<span id="profiles-loggin-state-${profile.username}" class="${is_connected ? 'bg-green-600' : 'bg-grey-500'} absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white shadow-lg transition-all duration-300"></span>
								</div>
							
								<div>
									<div class="flex items-center space-x-2">
										<span class="text-xl font-bold text-white transition-all duration-300 group-hover:text-blue-400 group-hover:scale-105">${profile.username}</span>
									</div>
							
									<div class="flex items-center space-x-4 text-sm mt-2">
										<span class="flex items-center text-yellow-400 transition-all duration-300 hover:scale-110 cursor-pointer">
											<svg class="w-5 h-5 mr-1 transition-transform duration-300 hover:rotate-12" fill="currentColor" viewBox="0 0 20 20">
												<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
											</svg>
											<span class="font-semibold">${profile.trophies}</span>
										</span>
										<span class="flex items-center text-green-400 transition-all duration-300 hover:scale-110 cursor-pointer">
											<svg class="w-5 h-5 mr-1 transition-transform duration-300 hover:scale-125" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
											</svg>
											<span class="font-semibold">${profile.wins}</span>
										</span>
										<span class="flex items-center text-red-400 transition-all duration-300 hover:scale-110 cursor-pointer">
											<svg class="w-5 h-5 mr-1 transition-transform duration-300 hover:scale-125" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
											</svg>
											<span class="font-semibold">${profile.losses}</span>
										</span>
									</div>
								</div>
							</div>
							<button 
								data-profile-answer="accept"
								data-profile-id="${profile.id}"
								class="link-btn px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-300 flex items-center shadow-md hover:shadow-xl transform hover:scale-110 group">
								<svg class="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
								</svg>
							</button>
							<button
								data-profile-answer="decline" 
								data-profile-id="${profile.id}"
								class="block-btn px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-300 flex items-center shadow-md hover:shadow-xl transform hover:scale-110 group">
								<svg class="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
								</svg>
							</button>
						</div>
					</div>`)
			});
			container.innerHTML = content.join("");
		}
		else {
			container.innerHTML = /*html*/`<span id="no_requests_span">${translations_profile[languageStore.language].no_friend_requests}</span>`
		}

	} catch (err: any) {

		showError('friend_requests_error', undefined, err.message);
	}
}
