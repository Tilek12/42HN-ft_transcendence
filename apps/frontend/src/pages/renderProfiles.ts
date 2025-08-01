import { getToken} from '../utils/auth'


const friend_request_action = (is_friend: number, peding_direction : string, other_profile_id: number) => {
	let res : string = '';
	if (is_friend)
		res =` <button data-profile-id = "${other_profile_id}" class="unlink-btn px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded">Unlink</button>`;
	else
	{
		if (peding_direction == null)
			res = `<button data-profile-id = "${other_profile_id}" class=" link-btn px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">Link</button>`;
		else
			res =`<button data-profile-id = "${other_profile_id}" class=" pending-btn px-4 py-2 bg-gray-600 text-white opacity-50 rounded">Pending...</button>`;
	}
	return res
}
const block_action = (is_blocking : number, other_profile_id: number) => {
	let res : string = '';
	if(!is_blocking)
		res = `<button data-profile-id = "${other_profile_id}" class=" block-btn px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">Block</button>`;
	else
		res =`<button data-profile-id = "${other_profile_id}" class=" unblock-btn px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded">Unblock</button>`;
	return res
}
export async function renderProfilesList () 
{

	const container = document.getElementById('profiles-list');
	const BACKEND_URL : string = import.meta.env.VITE_BACKEND_URL;
	if (!container) return;
	const token = getToken();
	try
	{
		const res = await fetch('/api/parse-profiles', 
			{headers: {Authorization: `Bearer ${token}`}
		});
	// I need a logic only if they are friends or not if they are friends I need to show a button send friend request or an friend icon

	const data = await res.json();
	container.innerHTML = `<h1 class="text-2xl font-bold mb-4 bg-white p-4 rounded-xl shadow mb-2">Users List</h1>` + data.profiles.filter((profile : any)=> !profile.is_blocked).map((profile: any) => 
		`<div class = "flex items-center bg-white p-4 rounded-xl shadow mb-2">
			<img src= "${BACKEND_URL}/profile_pics/${profile.image_path}" class="w-12 h-12 rounded-full mr-4" />
			<div>
				<a href="" class="text-lg font-semibold text-blue-600 hover:underline">${profile.username}</a>
				<p class="text-sm text-gray-600"> 🏆 ${profile.trophies} | ✅ ${profile.wins} | ❌ ${profile.losses} </p>
				<span class="${profile.logged_in ? 'text-green-600' :'text-gray-500'}">
					${profile.logged_in ? 'Online' : 'Offline'}
				</span>
					${friend_request_action(profile.is_friend, profile.pending_direction, profile.id)}
					${block_action(profile.is_blocking, profile.id)}
			</div>

		</div>`
	).join('');
	} catch (err){
		console.error('Failed to fetch profiles: ', err);
		container.innerHTML = `<p class="text-red-500>Could not load profiles list.</p>`
	}
}