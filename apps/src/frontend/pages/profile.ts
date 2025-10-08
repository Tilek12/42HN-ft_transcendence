import { renderNav } from './nav'
import { getToken, clearToken, validateLogin } from '../utils/auth'
import { renderProfilesList } from './renderProfiles';
import { renderUserProfile, profile_ids, update_langauge_headers_user_profile } from './renderUserProfile';
import type { Profile_details } from './renderUserProfile';
import { listenerFriendAndBlock } from './ListenerProfileList';
import { listenerDeletePicture, listenerLogoutBtn, listenerUploadPicture } from './listenerUploadAndDeletePicture';
import { getEnvVariable } from './TypeSafe';
import {listenerPasswordCancel, listenerPasswordEdit, listenerPasswordUpdate} from './listenerUpdatePasswordAndUsername';
import {listenerUsernameUpdate, listenerUsernameCancel, listenerUsernameEdit} from './listenerUpdatePasswordAndUsername' ;
import type {AllProfileWithLimitAndOffset, return_on_render} from './renderProfiles';
import {wsManager} from '../websocket/ws-manager';
// import {languageStore} from './languages';
import { initLang } from './nav';
import {languageStore} from  './languages';

let i = 0;
type Match =
{
	id: number,
	player1_id: number,
	player2_id: number,
	player1_score: number,
	player2_score: number,
	winner_id: number,
	is_tie: boolean,
	is_tournament_match: boolean,
	played_at: string,
	player1_username: string,
	player2_username: string,
	total_matches?: number,
	win_rate?: number,
};
const ref_obj_allProfiles : {allProfiles : {profiles: any[]}[]  | undefined} = {allProfiles : []};
// let allProfiles: {profiles : any[]}[] | undefined= [];
let profile_offset = 0;
let profile_limit = 3;
// let new_all_profiles : AllProfileWithLimitAndOffset | undefined;
let nav_profile_clicked = false;
let already_parsed : boolean | undefined = false;
let first_profile_render = 1;
let presenceList : any[] | undefined = [];

export const resetEventListeners = (elemnt_ids : string[]) : void =>
{
	elemnt_ids.forEach(id => 
	{
		const el = document.getElementById(id)
		if(el)
			el.replaceWith(el.cloneNode(true));
		// document.getElementById(id)!.innerHTML = ''
	});
}
const renderCheckerForProfiles = (load = false, nav_profile_clicked = false) =>
	{

		// console.log("ALL PROFILES ON RENDER", ref_obj_allProfiles.allProfiles)
		let listUsers = wsManager.presenceUserList.map((u)=>u.name);
		console.log(`Is ${JSON.stringify(listUsers) !== JSON.stringify(presenceList) ? ' ' : ' not '}changing`)
		if (load) first_profile_render--;
		if (JSON.stringify(listUsers) !== JSON.stringify(presenceList) || (first_profile_render == 1) || nav_profile_clicked)
		{
			if(load === false)
				{
					console.log("I'm In no load")
					first_profile_render++
				};
			presenceList = [...listUsers];
			// console.log("ALLLPROFILES INSIDE AUTORENDER===========>>>", ref_obj_allProfiles.allProfiles);
			// ref_obj_allProfiles.allProfiles?.forEach((pr)=> console.log("DEFAULT BEFORE MAPPING", pr.profiles[0].logged_in));
			ref_obj_allProfiles.allProfiles?.map((all) => all.profiles?.map((pr)=> {pr.logged_in = wsManager.presenceUserList.map((u)=> u.name).includes(pr.username); return pr;}));
			ref_obj_allProfiles.allProfiles?.map((all) => all.profiles?.forEach((pr) =>
			{
				// console.log(`changing on rendering of user ${pr.username}, ${pr.logged_in}`);
				const profile_loggin_state = document.getElementById(`profiles-loggin-state-${pr.username}`) as HTMLSpanElement;
				profile_loggin_state?.classList.add(`${pr.logged_in ? 'text-green-600' :'text-gray-500'}`);
				profile_loggin_state?.classList.remove(`${!pr.logged_in ? 'text-green-600' :'text-gray-500'}`);
				if (profile_loggin_state)
					profile_loggin_state.innerHTML = '●';
			}))
		}
		if(!load)
			setTimeout(renderCheckerForProfiles, 500);
		// return allProfiles
	}
export async function renderProfile(root: HTMLElement) {
  const isValid = await validateLogin()
  if (!isValid) {
    location.hash = '#/login'
    return;
  }

  fetch('/api/private/profile', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getToken()}` }
  })
    .then(res => res.json())
    .then(data => {
      if (data.message === 'User or profile not found' ||
		data.message === 'Invalid or expired token') {
        	clearToken();
        	location.hash = '#/login';
        	return;
      };

	const BACKEND_URL = getEnvVariable('VITE_BACKEND_URL');
    root.innerHTML = renderUserProfile(BACKEND_URL, data, languageStore.language);
	// initLang();

	
	let profile_details : Profile_details =
	{
		backend_url: BACKEND_URL,
		data_async: data,
		profile_pic_id: `profile_pic`,
		logged_in_id: `logged_in`,
		username_id: `username`,
		email_id: `email`,
		wins_id: `wins`,
		losses_id: `losses`,
		trophies_id: `trophies`,
		created_at_id: `created_at`
	}
	languageStore.subscribe((lang) =>
		{
			i++;
			// console.log("i is:", i);
			// console.log("languageStore is:", languageStore.clicked);
			// if (languageStore.clicked == i)
			// {
				console.log("#######================the languge change==========================");
				console.log("SubsCRIBE the render is being called");
				setTimeout(() => update_langauge_headers_user_profile(languageStore.language), 0);             
				// renderProfile(root);
			// }
				
			// console.log("Dataa: ", data);
			// initLang();
		}
	);
	//---------------Password Related Variables------------------------------------
	const password_old_check = document.getElementById('password-old-check') as HTMLInputElement;
	const password_new = document.getElementById('password-new') as HTMLInputElement;
	const password_confirm = document.getElementById('password-confirm') as HTMLInputElement;
	const password_edit_btn = document.getElementById('password-edit-btn') as HTMLButtonElement;
	const password_update_btn = document.getElementById('password-update-btn') as HTMLButtonElement;
	const password_cancel_btn = document.getElementById('password-cancel-btn') as HTMLButtonElement;
	//--------------Username Related Variables-------------------------------------
	const username_update_btn = document.getElementById('username-update-btn') as HTMLButtonElement;
	const username_cancel_btn = document.getElementById('username-cancel-btn') as HTMLButtonElement;
	const username_edit_btn = document.getElementById('username-edit-btn') as HTMLButtonElement;

	const username_par_el= document.getElementById('username') as HTMLParagraphElement;
	const username_input_el = document.getElementById('username-input') as HTMLInputElement;

	setTimeout(() => profile_ids(profile_details), 0);
	setTimeout(() => update_langauge_headers_user_profile(languageStore.language), 0);
	document.getElementById('nav_profile')?.addEventListener('click', ()=> {nav_profile_clicked = true;});
	(async () =>{
				const r_on_r = await  renderProfilesList('profiles-list', false, ref_obj_allProfiles.allProfiles, profile_offset, profile_limit, already_parsed); 
				ref_obj_allProfiles.allProfiles = r_on_r?.allProfiles;
				// console.log("THE PROFILES ON LOAD+++++",ref_obj_allProfiles.allProfiles);
				console.log("check render what is returning: ++++ ONLOAD", renderCheckerForProfiles());
				already_parsed = r_on_r?.already_parsed;
	})();

	document.getElementById('more-profiles-btn')?.addEventListener('click', async ()=>
	{
		profile_offset+=profile_limit;
		const r_on_r = await  renderProfilesList('profiles-list', true, ref_obj_allProfiles.allProfiles, profile_offset, profile_limit);
		ref_obj_allProfiles.allProfiles = r_on_r?.allProfiles;
		already_parsed =r_on_r?.already_parsed;
		// console.log("THE PROFILES ON LOAD+++++",ref_obj_allProfiles.allProfiles);
		(true) !== undefined
		console.log("check render what is returning: ++++ ONLOAD", renderCheckerForProfiles(true));
	})
	document.getElementById('password-edit-btn')?.addEventListener('click', ()=> 
		listenerPasswordEdit(
			password_old_check,
			password_new, 
			password_confirm, 
			password_update_btn, 
			password_cancel_btn, 
			password_edit_btn
		))
	document.getElementById('password-cancel-btn')?.addEventListener('click', ()=>
		listenerPasswordCancel(
			password_old_check,
			password_new, 
			password_confirm, 
			password_update_btn, 
			password_cancel_btn, 
			password_edit_btn
		))
	document.getElementById('password-update-btn')?.addEventListener('click', async ()=>
		listenerPasswordUpdate(
			password_old_check,
			password_new, 
			password_confirm, 
			password_update_btn, 
			password_cancel_btn, 
			password_edit_btn
		));
	document.getElementById('username-update-btn')?.addEventListener
		('click', async () =>
	listenerUsernameUpdate(
		username_cancel_btn, 
		username_update_btn, 
		username_edit_btn, 
		username_input_el, 
		username_par_el
	))
	document.getElementById('username-cancel-btn')?.addEventListener('click', ()=> listenerUsernameCancel(
		username_cancel_btn,
		username_update_btn,
		username_edit_btn,
		username_input_el,
		username_par_el
	));
	document.getElementById('username-edit-btn')?.addEventListener('click', ()=> listenerUsernameEdit(
		username_cancel_btn,
		username_update_btn,
		username_edit_btn,
		username_input_el,
		username_par_el
	));
	//----------------load pagination process--------------------------------------
	document.getElementById('profiles-list')?.addEventListener
		('click', async (e) => {ref_obj_allProfiles.allProfiles = await listenerFriendAndBlock(e, 'profiles-list', false, ref_obj_allProfiles.allProfiles, profile_offset, profile_limit)});
	document.getElementById('upload-form')?.addEventListener
		('submit', async (e) => listenerUploadPicture(e));
	document.getElementById('delete-pic-btn')?.addEventListener
		('click', async (e) => listenerDeletePicture(e));
	document.getElementById('logout-btn')?.addEventListener
		('click', async (e) => listenerLogoutBtn(e));
	
	//==================Linda's code==========================
		  fetch('/api/private/match/user', {
			headers: {
			  'Authorization': `Bearer ${getToken()}`
			}
		  })
			.then(res => res.json())
			.then((data) => {
			  const matchContainer = document.getElementById('match-history') as HTMLElement;
			//   console.log("data: ", data);
			  const matches = data.matches;
			  if (!matchContainer) return;

			  if (!Array.isArray(matches) || matches.length === 0) {
				// matchContainer.innerHTML += `
				// <p>No matches found.</p>`;
				return;
			  }
			matchContainer.innerHTML += `
			<div class="overflow-x-auto">
				<table class="w-full text-left border-collapse shadow rounded-lg">
				<thead class="bg-gray-100">
					<tr>
					<th class="py-2 px-4">Opponent</th>
					<th class="py-2 px-4">Score</th>
					<th class="py-2 px-4">Result</th>
					<th class="py-2 px-4">Played At</th>
					<th class="py-2 px-4">Wins</th>
					<th class="py-2 px-4">Total Matches</th>
					<th class="py-2 px-4">Win Rate</th>
					</tr>
				</thead>
				<tbody>
					${matches.map((match : Match, index) => `
					<tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
						<td class="py-2 px-4">${match.player1_id === data.profile_id ? match.player2_username : match.player1_username}</td>
						<td class="py-2 px-4">
						${match.player1_id === data.profile_id
							? `${match.player1_score} - ${match.player2_score}`
							: `${match.player2_score} - ${match.player1_score}`}
						</td>
						<td class="py-2 px-4">
						${match.winner_id === null
							? 'Tie'
							: match.winner_id === data.profile_id ? 'Win' : 'Loss'}
						</td>
						<td class="py-2 px-4">${new Date(match.played_at).toLocaleString()}</td>
						<td class="py-2 px-4">${index == 0 ? data.win : ''}</td>
						<td class="py-2 px-4">${index == 0 ? data.matches_count : ''}</td>
						<th class="py-2 px-4">${index == 0 ? data.win_rate + "%" : ''}</th>
					</tr>
					`).join('')}
				</tbody>
				</table>
			</div>
			`;

			})
			.catch(err => {
			  console.error('Failed to load matches:', err);
			});
	//==============Linda's code=================================
	})
	.catch(() => {
	  root.innerHTML = `<p class="text-red-400">❌ Failed to fetch profile.</p>`;})
}
