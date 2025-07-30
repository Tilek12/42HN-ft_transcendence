import { getToken} from '../utils/auth'

export async function renderFriendsList()
{
	const container = document.getElementById('friends-list');
	const BACKEND_URL : string = import.meta.env.VITE_BACKEND_URL;
	if (!container) return;
	try
	{
		const res = await fetch('/api/parse-friends', 
			{headers: {Authorization: `Bearer ${getToken()}`}
		});
	const data = await res.json();
	container.innerHTML = `<h1 class="text-2xl font-bold mb-4 bg-white p-4 rounded-xl shadow mb-2">Friends List</h1>` + data.friends.map((friend: any) => 
		`<div class = "flex items-center bg-white p-4 rounded-xl shadow mb-2">
			<img src= "${BACKEND_URL}/profile_pics/${friend.image_path}" class="w-12 h-12 rounded-full mr-4" />
		<div>
			<a href="" class="text-lg font-semibold text-blue-600 hover:underline">${friend.username}</a>
			<p class="text-sm text-gray-600"> 🏆 ${friend.trophies} | ✅ ${friend.wins} | ❌ ${friend.losses} </p>
			<span class="${friend.logged_in ? 'text-green-600' :'text-gray-500'}">
				${friend.logged_in ? 'online' : 'offline'}
			</span>
		</div>
		</div>`
	).join('');
	} catch (err){
		console.error('Failed to fetch friends: ', err);
		container.innerHTML = `<p class="text-red-500>Could not load friends list.</p>`
	}
}