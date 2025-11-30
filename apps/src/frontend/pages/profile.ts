
import { getUser, clearUser, setUser, apiFetch } from '../utils/auth.js'
import { AllProfileWithLimitAndOffset, renderProfilesList } from './renderProfiles.js';
import { renderUserProfile, fill_profile_info, update_langauge_headers_user_profile } from './renderUserProfile.js';
import type { Profile_details } from './renderUserProfile.js';
import { listenerFriendAndBlock } from './ListenerProfileList.js';
import { listenerDeletePicture, listenerUploadPicture } from './listenerUploadAndDeletePicture.js';
import { listenerPasswordCancel, listenerPasswordEdit, listenerPasswordUpdate } from './listenerUpdatePasswordAndUsername.js';
import { listenerUsernameUpdate, listenerUsernameCancel, listenerUsernameEdit } from './listenerUpdatePasswordAndUsername.js';
import { wsManager } from '../websocket/ws-manager.js';
import { languageStore } from './languages.js';
import { Match, fUser } from '../types.js';
import { renderConnectionErrorPage } from './error.js';
import { renderFriendsList } from './renderFriends.js';
import { renderFriendRequestsList } from './renderFriendRequestList.js';

let i = 0;

const ref_obj_allProfiles: { allProfiles: { profiles: any[] }[] | undefined } = { allProfiles: [] };
let allProfiles: { profiles: any[] }[] | undefined = [];
let profile_offset = 0;
let profile_limit = 3;
let new_all_profiles: AllProfileWithLimitAndOffset | undefined;
let nav_profile_clicked = false;
let already_parsed: boolean | undefined = false;
let first_profile_render = 1;
let presenceList: any[] | undefined = [];

export const resetEventListeners = (elemnt_ids: string[]): void => {
	elemnt_ids.forEach(id => {
		const el = document.getElementById(id)
		if (el)
			el.replaceWith(el.cloneNode(true));
		document.getElementById(id)!.innerHTML = ''
	});
}


//this function renders the profiles that are online ?
const renderCheckerForProfiles = (load = false, nav_profile_clicked = false) => {

	// console.log("ALL PROFILES ON RENDER", ref_obj_allProfiles.allProfiles)
	let listUsers = wsManager.presenceUserList.map((u) => u.name);
	console.log(`Is ${JSON.stringify(listUsers) !== JSON.stringify(presenceList) ? ' ' : ' not '}changing`)
	if (load) first_profile_render--;
	if (JSON.stringify(listUsers) !== JSON.stringify(presenceList) || (first_profile_render == 1) || nav_profile_clicked) {
		if (load === false) {
			console.log("I'm In no load")
			first_profile_render++
		};
		presenceList = [...listUsers];
		// console.log("ALLLPROFILES INSIDE AUTORENDER===========>>>", ref_obj_allProfiles.allProfiles);
		ref_obj_allProfiles.allProfiles?.forEach((pr) => console.log("DEFAULT BEFORE MAPPING", pr.profiles[0].logged_in));
		ref_obj_allProfiles.allProfiles?.map((all) => all.profiles?.map((pr) => { pr.logged_in = wsManager.presenceUserList.map((u) => u.name).includes(pr.username); return pr; }));
		ref_obj_allProfiles.allProfiles?.map((all) => all.profiles?.forEach((pr) => {
			console.log(`changing on rendering of user ${pr.username}, ${pr.logged_in}`);
			const profile_loggin_state = document.getElementById(`profiles-loggin-state-${pr.username}`) as HTMLSpanElement;
			if (profile_loggin_state) {
				profile_loggin_state.classList.remove('bg-green-500', 'bg-gray-400');
				profile_loggin_state.classList.add(pr.logged_in ? 'bg-green-500' : 'bg-gray-400');
			}
		}))
	}
	if (!load)
		setTimeout(renderCheckerForProfiles, 2000);
	// return allProfiles
}
export async function renderProfile(root: HTMLElement) {
	apiFetch('/api/private/profile', {
		method: 'GET',
		credentials: 'include'
	})
		.then(res => res.json()
		)
		.then(data => {
			if (data.message === 'User or profile not found' ||
				data.message === 'Invalid or expired token') {
				console.log('prfile render fail1');
				clearUser();
				location.hash = '#/login';
				return;
			};
			const { username, image_blob, wins,	losses,	trophies} = data;
			let user = getUser();
			root.innerHTML = renderUserProfile();
			if (user){
				user.username = username;
				user.image_blob = image_blob;
				user.wins = wins,
				user.losses= losses,
				user.trophies = trophies,
				setUser(user);
				fill_profile_info(user);
			}

			//enable reload of profiles on click of navbar profiles it doesnt go through router and so makes sense to add here, nice -p
			document.getElementById('nav_profile')?.addEventListener('click', () => { nav_profile_clicked = true; });

			//render the profile list asyncronously
			(async () => {
				const r_on_r = await renderProfilesList('profiles-list', false, ref_obj_allProfiles.allProfiles, profile_offset, profile_limit, already_parsed);
				ref_obj_allProfiles.allProfiles = r_on_r?.allProfiles;
				already_parsed = r_on_r?.already_parsed;
			})();

			//render friends list
			(async()=>{renderFriendsList('friend-list');})();
			//render freind request list
			(async()=>{renderFriendRequestsList();})();


			//more-profiles button event listener, 
			document.getElementById('more-profiles-btn')?.addEventListener('click', async () => {
				profile_offset += profile_limit;
				const r_on_r = await renderProfilesList('profiles-list', true, ref_obj_allProfiles.allProfiles, profile_offset, profile_limit);
				ref_obj_allProfiles.allProfiles = r_on_r?.allProfiles;
				already_parsed = r_on_r?.already_parsed;
				console.log("check render what is returning: ++++ ONLOAD", renderCheckerForProfiles(true));
			})


			//----------------load pagination process--------------------------------------
			document.getElementById('profiles-list')?.addEventListener
				('click', async (e) => {
					ref_obj_allProfiles.allProfiles = await listenerFriendAndBlock(e, 'profiles-list', false, ref_obj_allProfiles.allProfiles, profile_offset, profile_limit)
				});
			document.getElementById('upload-form')?.addEventListener
				('submit', async (e) => listenerUploadPicture(e));

			document.getElementById('delete-pic-btn')?.addEventListener
				('click', async (e) => listenerDeletePicture(e));


			// renders match history
			//==================Linda's code==========================
			apiFetch('/api/private/match/user', {
				method: 'GET',
				credentials: 'include',
			})
				.then(res => res.json())
				.then((data) => {
					const matchContainer = document.getElementById('match-history') as HTMLElement;
					console.log("data: ", data);
					const matches = data.matches;
					if (!matchContainer) return;

					if (!Array.isArray(matches) || matches.length === 0) {
						matchContainer.innerHTML += `
						<p>No matches found.</p>`;
						return;
					}
					matchContainer.innerHTML +=
						/*html*/
						`
			<div class="overflow-x-auto rounded-xl">
				<table class="w-full text-left border-collapse">
				<thead>
					<tr class="bg-white/20 backdrop-blur-sm">
					<th class="py-3 px-4 text-white font-semibold">Opponent</th>
					<th class="py-3 px-4 text-white font-semibold">Score</th>
					<th class="py-3 px-4 text-white font-semibold">Result</th>
					<th class="py-3 px-4 text-white font-semibold">Played At</th>
					<th class="py-3 px-4 text-white font-semibold">Wins</th>
					<th class="py-3 px-4 text-white font-semibold">Total Matches</th>
					<th class="py-3 px-4 text-white font-semibold">Win Rate</th>
					</tr>
				</thead>
				<tbody>
					${matches.map((match: Match, index) => /*html*/`
					<tr class="border-t border-white/10 ${index % 2 === 0 ? 'bg-white/5' : 'bg-white/10'} hover:bg-white/20 transition-colors duration-200">
						<td class="py-3 px-4 text-white font-medium">${match.player1_id === data.profile_id ? match.player2_username : match.player1_username}</td>
						<td class="py-3 px-4 text-white font-mono">
						${match.player1_id === data.profile_id
								? `<span class="font-bold text-blue-400">${match.player1_score}</span> - <span class="text-gray-300">${match.player2_score}</span>`
								: `<span class="font-bold text-blue-400">${match.player2_score}</span> - <span class="text-gray-300">${match.player1_score}</span>`}
						</td>
						<td class="py-3 px-4">
						<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${match.winner_id === null
								? 'bg-gray-500/30 text-gray-200'
								: match.winner_id === data.profile_id
									? 'bg-green-500/30 text-green-300'
									: 'bg-red-500/30 text-red-300'}">
							${match.winner_id === null
								? '⚖️ Tie'
								: match.winner_id === data.profile_id ? '🏆 Win' : '❌ Loss'}
						</span>
						</td>
						<td class="py-3 px-4 text-gray-300 text-sm">${new Date(match.played_at).toLocaleString()}</td>
						<td class="py-3 px-4 text-green-400 font-bold">${index == 0 ? data.win : ''}</td>
						<td class="py-3 px-4 text-blue-400 font-bold">${index == 0 ? data.matches_count : ''}</td>
						<td class="py-3 px-4">
							${index == 0 ? `<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/30 text-purple-300">${data.win_rate}%</span>` : ''}
						</td>
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

			// set all corect language strings
			update_langauge_headers_user_profile(languageStore.language);
			//make sure the language strings update on language
			languageStore.subscribe((lang) => update_langauge_headers_user_profile(lang));
		})
		.catch(() => {
			renderConnectionErrorPage();
		})
}
