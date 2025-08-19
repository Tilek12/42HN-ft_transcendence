import { getToken} from '../utils/auth'
import { getEnvVariable } from './TypeSafe';
import { wsManager } from '../websocket/ws-manager';

// let lastPresence : any[] | undefined = [];
// let all_friends_len : number |undefined = 0;
// let firstTime = 1
export async function renderFriendsList(container_id : string, load?: boolean, allFriends ?: {friends: any[]}, friend_offeset ?: number, friend_limit ?: number )
{
	const container = document.getElementById(container_id);
	const BACKEND_URL : string = getEnvVariable('VITE_BACKEND_URL');
	if (!container) return;
	try
	{
		const res = await fetch(
			'/api/private/parse-friends', 
			{
				headers: {Authorization: `Bearer ${getToken()}`},
			});
	const data = await res.json();
	// let data_friends_len = data.friends.length;
	
	container.innerHTML = `<h1 class="text-2xl font-bold mb-4 bg-white p-4 rounded-xl shadow mb-2">Friends List</h1>` + data.friends.map((friend: any) =>
	{
		let is_connected;
		let listUsers : any[] | undefined = wsManager.presenceUserList.map((u)=> u.name);
		// console.log(`${friend.username}`);
		console.log(`${friend.username} is ${is_connected ? " " : "not " }connected`);
		is_connected = listUsers.includes(friend.username);
		const img_src = friend.image_blob ? 
				`data:image/webp;base64,${friend.image_blob}` : 
				`${BACKEND_URL}/profile_pics/${friend.image_path}`;
		return `<div class = "flex items-center bg-white p-4 rounded-xl shadow mb-2">
			<img src= "${img_src}" class="w-12 h-12 rounded-full mr-4" />
		<div>
			<a href="" class="text-lg font-semibold text-blue-600 hover:underline">${friend.username}</a>
			<p class="text-sm text-gray-600"> 🏆 ${friend.trophies} | ✅ ${friend.wins} | ❌ ${friend.losses} </p>
			<span class="${is_connected ? 'text-green-600' :'text-gray-500'}">
				${is_connected ? 'online' : 'offline'}
			</span>
		</div>
		</div>`
	}
	).join('');
	} catch (err){
		console.error('Failed to fetch friends: ', err);
		container.innerHTML = `<p class="text-red-500>Could not load friends list.</p>`
	}
}