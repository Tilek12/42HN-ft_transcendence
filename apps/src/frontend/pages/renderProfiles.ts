import { getToken} from '../utils/auth'
import { getEnvVariable } from './TypeSafe';
import { wsManager } from '../websocket/ws-manager';

export type AllProfileWithLimitAndOffset = 
{
	AllProfiles : any[] | undefined,
	limit : number,
	offset : number
};
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

const remove_load_btn = async (offset_pr: number, limit_pr: number, token_async: any, res_async : any, remove_reload_button ?:boolean) : Promise<boolean>=>
{
	offset_pr+=limit_pr;
	console.log("im Hereeeeeeeeeee: ");
	console.log("offset: ", offset_pr);
	console.log("limit_pr: ", limit_pr);
	res_async = await fetch(`/api/parse-profiles?offset=${offset_pr}&limit=${limit_pr}`,{headers: {Authorization: `Bearer ${token_async}`}});
	let newProfiles : {profiles : any[]} = await res_async.json();
	return newProfiles.profiles.length === 0
}
const array_to_html = (profile : any, BACKEND_URL : string) : string =>
{
	console.log("FrontEnd--------->>>> Profile : ", profile);
	const is_connected = wsManager.presenceUserList.map((u)=>u.name).includes(profile.username);

	const profile_pic_src = profile.image_blob ? `data:image/webp;base64,${profile.image_blob}` : `${BACKEND_URL}/profile_pics/${profile.image_path}`;
	return `<div class = "flex items-center bg-white p-4 rounded-xl shadow mb-2">
					<img src= "${profile_pic_src}" class="w-12 h-12 rounded-full mr-4" />
					<div>
						<a href="" class="text-lg font-semibold text-blue-600 hover:underline">${profile.username}</a>
						<p class="text-sm text-gray-600"> 🏆 ${profile.trophies} | ✅ ${profile.wins} | ❌ ${profile.losses} </p>
						<span class="${is_connected ? 'text-green-600' :'text-gray-500'}">
							${is_connected ? 'Online' : 'Offline'}
						</span>
							${friend_request_action(profile.is_friend, profile.pending_direction, profile.id)}
							${block_action(profile.is_blocking, profile.id)}
					</div>

				</div>`;
}
type AllProfileWithLimitAndOffset = 
{
	AllProfiles : any[] | undefined,
	limit : number,
	offset : number
};

export async function renderProfilesList (
	element_id : string, 
	load: boolean,  
	allProfiles: {profiles: any[]}[] | undefined,
	offset:number, 
	limit:number, actionBtn ?: boolean)  : 
	Promise<any[] | undefined>
{
	//profiles-list
	let return_res : AllProfileWithLimitAndOffset;
	const container  = document.getElementById(element_id);
	const BACKEND_URL = getEnvVariable('VITE_BACKEND_URL');
	let remove_load_button = false;
	let res : any;
	if (!container) return;
		const token = getToken();
	try
	{
		if(!load)
		{
			limit = offset + limit;
			offset = 0;
		}
		// limit = 4;
		// offset = 0;
		res = await fetch(`/api/parse-profiles?offset=${offset}&limit=${limit}`,{headers: {Authorization: `Bearer ${token}`}});
		if (actionBtn == true)
			allProfiles =[];
		let newProfiles : {profiles : any[]} = await res.json();
		// console.log("newProfiles: ", newProfiles);
		// console.log("allProfiles: ", allProfiles);
		allProfiles = allProfiles?.concat(newProfiles);
		console.log("allProfiles: ",allProfiles);
		remove_load_button = await remove_load_btn(offset, limit,token, res);
		if (remove_load_button) document.getElementById('more-profiles-btn')?.remove();
		let html = ``;
		if (allProfiles)
		{
			allProfiles.map((pr : any) => html+= pr.profiles.filter((profile : any)=> !profile.is_blocked).map((profile: any) =>
				array_to_html(profile, BACKEND_URL)).join(' '));
		}
		container.innerHTML = `<h1 class="text-2xl text-black font-bold mb-4 bg-white p-4 rounded-xl shadow mb-2">Users List</h1>` + html;

		return_res = {AllProfiles : allProfiles, limit : limit, offset : offset}
		// console.log(container.innerHTML);
		return return_res.AllProfiles;
	} catch (err){
		console.error('Failed to fetch profiles: ', err);
		container.innerHTML = `<p class="text-red-500>Could not load profiles list.</p>`
	}
}
