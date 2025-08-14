import { getToken} from '../utils/auth'


const button_action = (is_friend: number, pending_direction : string, other_profile_id: number) => {
	return `<button data-profile-answer = "accept" data-profile-id = "${other_profile_id}" class="answer-request-btn px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded">Accept</button>
			<button data-profile-answer = "decline" data-profile-id = "${other_profile_id}" class="answer-request-btn px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">Delete</button>`
}
export async function renderFriendRequestsList ()
{

	const container = document.getElementById('friend-requests-list');
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
	// console.log('data:');
	// console.log(data);
	const recievedRequests : number[]= data.profiles[0].received_requests;
	// console.log('received_profiles:');
	// console.log(data.received_requests);
	container.innerHTML = `<h1 class="text-2xl font-bold mb-4 bg-white p-4 rounded-xl shadow mb-2">Requests List</h1>` + data.profiles.filter((r : any) => recievedRequests.includes(r.id)).map((profile: any) =>
	{
		const src_img = profile.image_blob ? 
				`data:image/webp;base64,${profile.image_blob}` : 
				`${BACKEND_URL}/profile_pics/${profile.image_path}`;
		return `<div class = "flex items-center bg-white p-4 rounded-xl shadow mb-2">
			<img src= "${src_img}" class="w-12 h-12 rounded-full mr-4" />
			<div>
				<a href="" class="text-lg font-semibold text-blue-600 hover:underline">${profile.username}</a>
				<p class="text-sm text-gray-600"> 🏆 ${profile.trophies} | ✅ ${profile.wins} | ❌ ${profile.losses} </p>
				<span class="${profile.logged_in ? 'text-green-600' :'text-gray-500'}">
					${profile.logged_in ? 'Online' : 'Offline'}
				</span>
					${button_action(profile.is_friend, profile.pending_direction, profile.id)}
			</div>

		</div>`
	}
	).join('');
	} catch (err){
		console.error('Failed to fetch profiles: ', err);
		container.innerHTML = `<p class="text-red-500>Could not load request list.</p>`
	}
}
