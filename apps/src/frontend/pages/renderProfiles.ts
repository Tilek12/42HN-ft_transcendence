import { getToken} from '../utils/auth'
import { getEnvVariable } from './TypeSafe';
import { wsManager } from '../websocket/ws-manager';
import {languageStore, translations_friends} from './languages';
import type {Language} from './languages';

let lastPresence : any[] | undefined = [];
let all_profiles_length : number |undefined = 0;

export type AllProfileWithLimitAndOffset = 
{
	AllProfiles : any[] | undefined,
	limit : number,
	offset : number,
	already_parsed ?: boolean | undefined
};
export type return_on_render = {
	allProfiles: {profiles: any[]}[] | undefined, 
	already_parsed : boolean | undefined
}
const friend_request_action = (is_friend: number, peding_direction : string, other_profile_id: number) => {
	let res : string = '';
	if (is_friend)
		res =` 
        <button 
            data-profile-id="${other_profile_id}" 
            class="unlink-btn px-16 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded"
            title="Remove Friend">
            ✖
        </button>`;
	else
	{
		if (peding_direction == null)
			res = `<button data-profile-id = "${other_profile_id}" class=" link-btn px-16 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">➕</button>`;
		else
			res =`<button data-profile-id = "${other_profile_id}" class=" pending-btn px-16 py-2 bg-gray-600 text-white opacity-50 rounded">⏳</button>`;
	}
	return res
}
const block_action = (is_blocking : number, other_profile_id: number) => {
	let res : string = '';
	if(!is_blocking)
		res = `<button data-profile-id = "${other_profile_id}" class=" block-btn px-16 py-2 bg-red-600 hover:bg-red-700 text-white rounded">⛔</button>`;
	else
		res =`<button data-profile-id = "${other_profile_id}" class=" unblock-btn px-16 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded">🔓</button>`;
	return res
}

const remove_load_btn = async (offset_pr: number, limit_pr: number, token_async: any, res_async : any, remove_reload_button ?:boolean) : Promise<boolean>=>
{
	offset_pr+=limit_pr;
	// console.log("im Hereeeeeeeeeee: ");
	// console.log("offset: ", offset_pr);
	// console.log("limit_pr: ", limit_pr);
	res_async = await fetch(`/api/private/parse-profiles?offset=${offset_pr}&limit=${limit_pr}`,{headers: {Authorization: `Bearer ${token_async}`}});
	let newProfiles : {profiles : any[]} = await res_async.json();
	return newProfiles.profiles.length === 0
}

const array_to_html = (profile : any, BACKEND_URL : string, profiles_len?: number) : string =>
{
	let is_connected;
	const listUsers :any[] | undefined = wsManager.presenceUserList.map((u)=> u.name);
	is_connected = listUsers.includes(profile.username);
	
	const profile_pic_src = profile.image_blob ? `data:image/webp;base64,${profile.image_blob}` : `${BACKEND_URL}/profile_pics/${profile.image_path}`;
	return `<div class = "flex items-center bg-white p-4 rounded-xl shadow mb-2">
				<img src= "${profile_pic_src}" class="w-12 h-12 rounded-full mr-4" />
				<div class = "flex items-center flex-col">
				   <div>
						<a href="" class="text-lg font-semibold text-blue-600 ">
							<span id="profiles-loggin-state-${profile.username}" class=" px-2 profiles-loggin-state">
							</span>${profile.username}
							<p class="text-sm text-gray-600"> 🏆 ${profile.trophies} | ✅ ${profile.wins} | ❌ ${profile.losses} </p>
						</a>
				   </div>
					<div>
					${friend_request_action(profile.is_friend, profile.pending_direction, profile.id)}
					${block_action(profile.is_blocking, profile.id)}
					</div>
				</div>
				</div>
			`;
}

export async function renderProfilesList (
	element_id : string, 
	load: boolean,  
	allProfiles: {profiles: any[]}[] | undefined,
	offset:number, 
	limit:number, actionBtn ?: boolean,
	already_parsed ?: boolean | undefined)  : 
	Promise<return_on_render | undefined>
{
	//profiles-list
	let return_res : AllProfileWithLimitAndOffset;
	const container  = document.getElementById(element_id);
	const BACKEND_URL = getEnvVariable('VITE_BACKEND_URL');
	let remove_load_button = false;
	let old_limit = limit;
	let old_offset = offset;
	let res : any;
	// languageStore.subscribe( async ()=>
	// {
	// 	res = await renderProfilesList(element_id, load, allProfiles, offset, limit);
	// 	allProfiles = res.AllProfiles;
	// })
	if (!container) return;
		const token = getToken();
	try
	{
		if(!load && !already_parsed)
		{
			limit = offset + limit;
			offset = 0;
		}
		// limit = 4;
		// offset = 0;
		// if (limit != old_limit)
		// console.log(`offset: ${offset} and limit: ${limit}`);
		if (!already_parsed || load)
		{
			res = await fetch(`/api/private/parse-profiles?offset=${offset}&limit=${limit}`,{headers: {Authorization: `Bearer ${token}`}});
			already_parsed = true;
		}
		if (actionBtn == true)
			allProfiles =[];
		let newProfiles : {profiles : any[]} = await res.json();
		// console.log("newProfiles: ", newProfiles);
		// console.log("allProfiles: ", allProfiles);
		// if (limit != old_limit)
			if(already_parsed && !load)
				allProfiles = [];
			allProfiles = allProfiles?.concat(newProfiles);
			if (!load)
				already_parsed = true;
		// console.log("allProfiles after concat: ",allProfiles);
		remove_load_button = await remove_load_btn(offset, limit,token, res);
		if (remove_load_button) document.getElementById('more-profiles-btn')?.remove();
		let html = ``;
		// console.log("All Profiles are existing : " allProfiles ? )
		if (allProfiles)
		{
			// console.log("NOW I'M HEREEEEEE inside", allProfiles);
			const print = allProfiles.map((pr : any) => html+= pr.profiles.filter((profile : any)=> !profile.is_blocked).map((profile: any) =>
				array_to_html(profile, BACKEND_URL, allProfiles?.length)).join(' '));
			// console.log("NOW I'M HEREEEEEE is printing?", print);
		}
		container.innerHTML = `<h1 class="text-2xl text-black font-bold mb-4 bg-white p-4 rounded-xl shadow mb-2">Users List</h1>` + html;
		// console.log(`before the set on RENDER PROFILES LIST +++`, allProfiles)
		allProfiles?.map((all) => all.profiles?.map((pr)=> {pr.logged_in = wsManager.presenceUserList.map((u)=> u.name).includes(pr.username); return pr;}));
		// console.log("HERE CHECK AFTER THE SECOND MAP");
		allProfiles?.map((all) => all.profiles?.forEach((pr) =>
			{
				// console.log(`changing on profile lists ${pr.username} to ${pr.logged_in}`);
				// console.log("===>>", document.getElementById(`profiles-loggin-state-${pr.username}`));
				const profile_loggin_state = document.getElementById(`profiles-loggin-state-${pr.username}`) as HTMLSpanElement;
				profile_loggin_state?.classList.add(`${pr.logged_in ? 'text-green-600' :'text-gray-500'}`);
				profile_loggin_state?.classList.remove(`${!pr.logged_in ? 'text-green-600' :'text-gray-500'}`);
				if(profile_loggin_state)
					profile_loggin_state.innerHTML ='●';
		}));
		// console.log("===================HERE CHECK AFTER THE LAST MAP=========================");
		return_res = {AllProfiles : allProfiles, limit : limit, offset : offset, already_parsed :already_parsed};
		const r_on_r : return_on_render = {allProfiles : return_res.AllProfiles, already_parsed : return_res.already_parsed };
		// console.log("===========r_on_r for check:=========== ", r_on_r);
		return r_on_r;
	} catch (err){
		console.error('Failed to fetch profiles: ', err);
	}
}
