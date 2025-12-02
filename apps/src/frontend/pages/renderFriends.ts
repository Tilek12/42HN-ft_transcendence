import { apiFetch, getUser } from '../utils/auth.js'
import { defaultPicture } from '../utils/constants.js';
import { wsManager } from '../websocket/ws-manager.js';
import { languageStore, translations_friends_render } from './languages.js';


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
		// let data_friends_len = data.friends.length;

		container.innerHTML =  data.friends.map((friend: any) => {
			let is_connected;
			let listUsers: any[] | undefined = wsManager.presenceUserList.map((u) => u.name);
			// console.log(`${friend.username}`);
			console.log(`${friend.username} is ${is_connected ? " " : "not "}connected`);
			is_connected = listUsers.includes(friend.username);
			const img_src = friend.image_blob ?
				`data:image/webp;base64,${friend.image_blob}` :
				defaultPicture
			return /*html*/`<div class = "flex items-center bg-grey-400 p-4 rounded-xl shadow mb-2">
			<img src= "${img_src}" class="w-12 h-12 rounded-full mr-4" />
		<div>
			<a href="" class="text-lg font-semibold text-blue-600">
				<span class="${is_connected ? 'text-green-600' : 'text-gray-500'}">
				●
				</span>
				${friend.username}
			</a>
			<p class="text-sm text-gray-600"> 🏆 ${friend.trophies} | ✅ ${friend.wins} | ❌ ${friend.losses} </p>

		</div>
		</div>`
		}
		).join('');
	} catch (err) {
		console.error('Failed to fetch friends: ', err);
		container.innerHTML = `<p class="text-red-500>Could not load friends list.</p>`
	}
}