import { apiFetch, getUser } from '../utils/auth.js'
import { defaultPicture } from '../utils/constants.js';
import { wsManager } from '../websocket/ws-manager.js';
import { languageStore, translations_friends } from './languages.js';


let lastPresence: any[] | undefined = [];
let all_profiles_length: number | undefined = 0;

export type AllProfileWithLimitAndOffset =
	{
		AllProfiles: any[] | undefined,
		limit: number,
		offset: number,
		already_parsed?: boolean | undefined
	};
export type return_on_render = {
	allProfiles: { profiles: any[] }[] | undefined,
	already_parsed: boolean | undefined
}
const friend_request_action = (is_friend: number, peding_direction: string, other_profile_id: number) => {
	let res: string = '';
	if (!is_friend)
	{
		if (peding_direction == null)
			res = /*html*/`<button data-profile-id = "${other_profile_id}" class="link-btn px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-300 flex items-center shadow-md hover:shadow-xl transform hover:scale-110 group">
				<svg class="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
				</svg>
			</button>`;
		else
			res =/*html*/`<button data-profile-id = "${other_profile_id}" class="pending-btn px-4 py-2 bg-gray-600 text-white opacity-50 rounded-lg flex items-center cursor-not-allowed">
				<svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
				</svg>
			</button>`;
	}
	return res
}


const block_action = (is_blocking: number, other_profile_id: number) => {
	let res: string = '';
	if (!is_blocking)
		res = /*html*/`<button data-profile-id = "${other_profile_id}" class="block-btn px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-300 flex items-center shadow-md hover:shadow-xl transform hover:scale-110 group">
			<svg class="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
			</svg>
		</button>`;
	else
		res =/*html*/`<button data-profile-id = "${other_profile_id}" class="unblock-btn px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all duration-300 flex items-center shadow-md hover:shadow-xl transform hover:scale-110 group">
			<svg class="w-5 h-5 transition-transform duration-300 group-hover:-rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path>
			</svg>
		</button>`;
	return res
}

const remove_load_btn = async (offset_pr: number, limit_pr: number, res_async: any, remove_reload_button?: boolean): Promise<boolean> => {
	offset_pr += limit_pr;
	// console.log("im Hereeeeeeeeeee: ");
	// console.log("offset: ", offset_pr);
	// console.log("limit_pr: ", limit_pr);
	res_async = await apiFetch(`/api/private/parse-profiles?offset=${offset_pr}&limit=${limit_pr}`, {
		method: 'GET',
		credentials: 'include',
	});
	let newProfiles: { profiles: any[] } = await res_async.json();
	return newProfiles.profiles.length === 0
}

const array_to_html = (profile: any, profiles_len?: number): string => {
	let is_connected;
	const listUsers: any[] | undefined = wsManager.presenceUserList.map((u) => u.name);
	is_connected = listUsers.includes(profile.username);

	const profile_pic_src = profile.image_blob ? `data:image/webp;base64,${profile.image_blob}` : `${defaultPicture}`;
	return /*html*/`<div class="flex items-center justify-between bg-white/10 backdrop-blur-md p-5 rounded-xl shadow-xl mb-4 border border-white/20 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:bg-white/15 hover:border-blue-400/50 group">
				<div class="flex items-center space-x-4">
					<div class="relative">
						<img src="${profile_pic_src}" class="w-16 h-16 rounded-full border-4 border-white/30 shadow-lg object-cover transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:border-blue-400" />
						<span id="profiles-loggin-state-${profile.username}" class="absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white profiles-loggin-state shadow-lg transition-all duration-300"></span>
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
				<div class="flex space-x-2">
					${friend_request_action(profile.is_friend, profile.pending_direction, profile.id)}
					${block_action(profile.is_blocking, profile.id)}
				</div>
			</div>
			`;
}

export async function renderProfilesList(
	element_id: string,
	load: boolean,
	allProfiles: { profiles: any[] }[] | undefined,
	offset: number,
	limit: number, actionBtn?: boolean,
	already_parsed?: boolean | undefined):
	Promise<return_on_render | undefined> {
	//profiles-list
	let return_res: AllProfileWithLimitAndOffset;
	const container = document.getElementById(element_id);

	let remove_load_button = false;
	let old_limit = limit;
	let old_offset = offset;
	let res: any;

	if (!container)
		return;

	try {
		if (!load && !already_parsed) {
			limit = offset + limit;
			offset = 0;
		}
		// limit = 4;
		// offset = 0;
		// if (limit != old_limit)
		// console.log(`offset: ${offset} and limit: ${limit}`);
		if (!already_parsed || load) {
			res = await apiFetch(`/api/private/parse-profiles?offset=${offset}&limit=${limit}`, {
				method: 'GET',
				credentials: 'include',
			});
			already_parsed = true;
		}
		if (actionBtn == true)
			allProfiles = [];
		let newProfiles: { profiles: any[] } = await res.json();
		// console.log("newProfiles: ", newProfiles);
		// console.log("allProfiles: ", allProfiles);
		// if (limit != old_limit)
		if (already_parsed && !load)
			allProfiles = [];
		allProfiles = allProfiles?.concat(newProfiles);
		if (!load)
			already_parsed = true;
		// console.log("allProfiles after concat: ",allProfiles);
		remove_load_button = await remove_load_btn(offset, limit, res);
		if (remove_load_button) document.getElementById('more-profiles-btn')?.remove();
		let html = ``;
		// console.log("All Profiles are existing : " allProfiles ? )
		if (allProfiles) {
			// console.log("NOW I'M HEREEEEEE inside", allProfiles);
			const print = allProfiles.map((pr: any) => html += pr.profiles.filter((profile: any) => !profile.is_blocked).map((profile: any) =>
				array_to_html(profile, allProfiles?.length)).join(' '));
			// console.log("NOW I'M HEREEEEEE is printing?", print);
		}
		container.innerHTML += html;
		// console.log(`before the set on RENDER PROFILES LIST +++`, allProfiles)
		allProfiles?.map((all) => all.profiles?.map((pr) => { pr.logged_in = wsManager.presenceUserList.map((u) => u.name).includes(pr.username); return pr; }));
		// console.log("HERE CHECK AFTER THE SECOND MAP");
		allProfiles?.map((all) => all.profiles?.forEach((pr) => {
			// console.log(`changing on profile lists ${pr.username} to ${pr.logged_in}`);
			// console.log("===>>", document.getElementById(`profiles-loggin-state-${pr.username}`));
			const profile_loggin_state = document.getElementById(`profiles-loggin-state-${pr.username}`) as HTMLSpanElement;
			
			if (profile_loggin_state) {
				profile_loggin_state.classList.remove('bg-green-500', 'bg-gray-400', 'animate-pulse');
				if (pr.logged_in) {
					profile_loggin_state.classList.add('bg-green-500', 'animate-pulse');
				} else {
					profile_loggin_state.classList.add('bg-gray-400');
				}
			}
		}));
		// console.log("===================HERE CHECK AFTER THE LAST MAP=========================");
		return_res = { 	AllProfiles: allProfiles,
						limit: limit,
						offset: offset,
						already_parsed: already_parsed 
					};
		const r_on_r: return_on_render = {	allProfiles: return_res.AllProfiles,
											already_parsed: return_res.already_parsed 
										};
	
		return r_on_r;
	} catch (err) {
		console.error('Failed to fetch profiles: ', err);
	}
}
