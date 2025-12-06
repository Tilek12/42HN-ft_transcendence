
import { getUser, clearUser, setUser, apiFetch, fetchUser } from '../utils/auth.js'
import { fetchProfiles,  renderProfiles } from './renderProfiles.js';
import { renderUserProfile, fill_profile_info, update_langauge_headers_user_profile } from './renderUserProfile.js';
import type { fProfile } from '../frontendTypes.js';
import { listenerFriendAndBlock } from './ListenerProfileList.js';

import { wsManager } from '../websocket/ws-manager.js';
import { languageStore } from './languages.js';
import { renderConnectionErrorPage } from './error.js';
import { fetchFriends, renderFriendsList } from './renderFriends.js';
import { renderFriendRequestsList } from './renderFriendRequestList.js';
import { friendsRequestListener } from './listenerFriendRequests.js';
import { renderMatchHistory } from './renderMatchHistory.js'
let i = 0;

// let profilesList: fProfile[];

// const ref_obj_allProfiles: { allProfiles: { profiles: any[] }[] | undefined } = { allProfiles: [] };


// let allProfiles: { profiles: any[] }[] | undefined = [];
// let profile_offset = 0;
// let profile_limit = 3;
// let new_all_profiles: AllProfileWithLimitAndOffset | undefined;
// let nav_profile_clicked = false;
// let already_parsed: boolean | undefined = false;
// let first_profile_render = 1;
// let presenceList: any[] | undefined = [];

// export const resetEventListeners = (elemnt_ids : string[]) : void =>
// {
// 	elemnt_ids.forEach(id => 
// 	{
// 		const el = document.getElementById(id)
// 		if(el)
// 			el.replaceWith(el.cloneNode(true));
// 		// document.getElementById(id)!.innerHTML = ''
// 	});
// }
// const renderCheckerForProfiles = (load = false, nav_profile_clicked = false) =>
// 	{

// 		// console.log("ALL PROFILES ON RENDER", ref_obj_allProfiles.allProfiles)
// 		let listUsers = wsManager.presenceUserList.map((u)=>u.name);
// 		console.log(`Is ${JSON.stringify(listUsers) !== JSON.stringify(presenceList) ? ' ' : ' not '}changing`)
// 		if (load) first_profile_render--;
// 		if (JSON.stringify(listUsers) !== JSON.stringify(presenceList) || (first_profile_render == 1) || nav_profile_clicked)
// 		{
// 			if(load === false)
// 				{
// 					console.log("I'm In no load")
// 					first_profile_render++
// 				};
// 			presenceList = [...listUsers];
// 			// console.log("ALLLPROFILES INSIDE AUTORENDER===========>>>", ref_obj_allProfiles.allProfiles);
// 			// ref_obj_allProfiles.allProfiles?.forEach((pr)=> console.log("DEFAULT BEFORE MAPPING", pr.profiles[0].logged_in));
// 			ref_obj_allProfiles.allProfiles?.map((all) => all.profiles?.map((pr)=> {pr.logged_in = wsManager.presenceUserList.map((u)=> u.name).includes(pr.username); return pr;}));
// 			ref_obj_allProfiles.allProfiles?.map((all) => all.profiles?.forEach((pr) =>
// 			{
// 				// console.log(`changing on rendering of user ${pr.username}, ${pr.logged_in}`);
// 				const profile_loggin_state = document.getElementById(`profiles-loggin-state-${pr.username}`) as HTMLSpanElement;
// 				profile_loggin_state?.classList.add(`${pr.logged_in ? 'text-green-600' :'text-gray-500'}`);
// 				profile_loggin_state?.classList.remove(`${!pr.logged_in ? 'text-green-600' :'text-gray-500'}`);
// 				if (profile_loggin_state)
// 					profile_loggin_state.innerHTML = '●';
// 			}))
// 		}
// 		if(!load)
// 			setTimeout(renderCheckerForProfiles, 500);
// 		// return allProfiles
// 	}
export async function renderProfile(root: HTMLElement) {

	try {

		await fetchUser();
		
		root.innerHTML = renderUserProfile(); //main html content
		
		fill_profile_info();

		
		// render friend request list
		renderFriendRequestsList();
		// wsManager.subscribeToPresence(renderFriendRequestsList);
		document.getElementById('friend-requests-list')?.addEventListener('click', friendsRequestListener);
		

		// render friends list
		renderFriendsList(); 
		// wsManager.subscribeToPresence(renderFriendsList);
		document.getElementById('friend-list')?.addEventListener('click', listenerFriendAndBlock);


		// Render user-list
		renderProfiles();
		// wsManager.subscribeToPresence(renderProfiles);
		// document.getElementById('more-profiles-btn')?.addEventListener('click', LoadMoreBtnListener);
		document.getElementById('profiles-list')?.addEventListener('click', listenerFriendAndBlock);


		// renders match history
		renderMatchHistory();

		// trigger reload
		document.getElementById('nav_profile')?.addEventListener('click', () => { renderProfile(root) });

		// set all correct language strings
		update_langauge_headers_user_profile(languageStore.language);
		//make sure the language strings update on language
		languageStore.subscribe((lang) => update_langauge_headers_user_profile(lang));
	}
	catch (e: any) {
		renderConnectionErrorPage();
	}
}
