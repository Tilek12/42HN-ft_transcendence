import { apiFetch, getUser } from '../utils/auth.js'
import { defaultPicture } from '../utils/constants.js';
import { wsManager } from '../websocket/ws-manager.js';
import { languageStore, translations_errors, translations_friends_render } from './languages.js';
import type { fProfile } from '../frontendTypes.js'

export async function renderFriendsList(container_id: string, load?: boolean, allFriends?: { friends: any[] }, friend_offeset?: number, friend_limit?: number) {
	const container = document.getElementById(container_id);
	if (!container) return;
	try {
		const res = await apiFetch(
			'/api/private/parse-friends', {
			method: 'GET',
			credentials: 'include',
		});
		const data = await res.json();

		container.innerHTML =  data.friends.map((friend: fProfile) => {
			let is_connected;

			let listUsers: any[] | undefined = wsManager.presenceUserList.map((u) => u.name);
			// console.log(`${friend.username}`);
			
			console.log(`${friend.username} is ${is_connected ? " " : "not "}connected`);
			
			is_connected = listUsers.includes(friend.username);
			
			const img_src = friend.image_blob ?
				`data:image/webp;base64,${friend.image_blob}` :
				defaultPicture
			return /*html*/`
			<div class = "flex items-center bg-grey-400 p-4 rounded-xl shadow mb-2">
				<img src= "${img_src}" class="w-12 h-12 rounded-full mr-4" />
				<div>
					<h1 href="" class="text-lg font-semibold text-blue-600">
					<span class="${is_connected ? 'text-green-600' : 'text-gray-500'}">●</span>
					${friend.username}
				</h1>
			<p class="text-sm text-gray-600"> 🏆 ${friend.trophies} | ✅ ${friend.wins} | ❌ ${friend.losses} </p>
		</div>
		 <button 
            data-profile-id="${friend.id}" 
            class="unlink-btn px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all duration-300 flex items-center shadow-md hover:shadow-xl transform hover:scale-110 group"
            title="Remove Friend">
            	<svg class="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"></path>
				</svg>
       		</button>;
		</div>`
		}
		).join('');

	} catch (err) {
		console.error('Failed to fetch friends: ', err);
		container.innerHTML = /*html*/`<p class="text-red-500"> ${translations_errors[languageStore.language].error_default} </p>`
	}
}