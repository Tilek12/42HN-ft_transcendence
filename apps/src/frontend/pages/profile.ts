import { renderNav } from './nav'
import { renderBackgroundTop } from '../utils/layout'
import { getToken, clearToken, validateLogin } from '../utils/auth'
import { renderProfilesList } from './renderProfiles';
import { renderUserProfile, profile_ids } from './renderUserProfile';
import type { Profile_details } from './renderUserProfile';
import { listenerFriendAndBlock } from './ListenerProfileList';
import { listenerDeletePicture, listenerLogoutBtn, listenerUploadPicture } from './listenerUploadAndDeletePicture';
import { getEnvVariable } from './TypeSafe';

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
export async function renderProfile(root: HTMLElement) {
  const isValid = await validateLogin()
  if (!isValid) {
    location.hash = '#/login'
    return;
  }

  fetch('/api/profile', {
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
    root.innerHTML = renderNav() + renderUserProfile(BACKEND_URL, data);

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
	//----------------load pagination process--------------------------------------
	let allProfiles: {profiles : any[]}[] | undefined= [];
	let profile_offset = 0;
	let profile_limit = 1;
	setTimeout(() => profile_ids(profile_details), 0);
	(async () =>{
		allProfiles = await  renderProfilesList('profiles-list', false, allProfiles, profile_offset, profile_limit);
	})();
	document.getElementById('password-edit-btn')?.addEventListener('click', ()=>{
		const password_old_check = document.getElementById('password-old-check') as HTMLInputElement;
		const password_new = document.getElementById('password-new') as HTMLInputElement;
		const password_confirm = document.getElementById('password-confirm') as HTMLInputElement;
		const password_edit_btn = document.getElementById('password-edit-btn') as HTMLButtonElement;
		const password_update_btn = document.getElementById('password-update-btn') as HTMLButtonElement;
		const password_cancel_btn = document.getElementById('password-cancel-btn') as HTMLButtonElement;

		password_old_check?.classList.remove('hidden');
		password_new?.classList.remove('hidden');
		password_confirm?.classList.remove('hidden');
		password_update_btn?.classList.remove('hidden');
		password_cancel_btn?.classList.remove('hidden');
		password_edit_btn?.classList.add('hidden');
	})
	document.getElementById('password-cancel-btn')?.addEventListener('click', ()=>{
		const password_old_check = document.getElementById('password-old-check') as HTMLInputElement;
		const password_new = document.getElementById('password-new') as HTMLInputElement;
		const password_confirm = document.getElementById('password-confirm') as HTMLInputElement;
		const password_edit_btn = document.getElementById('password-edit-btn') as HTMLButtonElement;
		const password_update_btn = document.getElementById('password-update-btn') as HTMLButtonElement;
		const password_cancel_btn = document.getElementById('password-cancel-btn') as HTMLButtonElement;

		password_old_check?.classList.add('hidden');
		password_new?.classList.add('hidden');
		password_confirm?.classList.add('hidden');
		password_update_btn?.classList.add('hidden');
		password_cancel_btn?.classList.add('hidden');
		password_edit_btn?.classList.remove('hidden');
	})
	document.getElementById('password-update-btn')?.addEventListener('click', async ()=>{
		// I want to check if the typed password in the first part is the same with the old password
		//if the new and confirm are not empty and the same and not the same with the old password
		const password_old_check = document.getElementById('password-old-check') as HTMLInputElement;
		const password_new = document.getElementById('password-new') as HTMLInputElement;
		const password_confirm = document.getElementById('password-confirm') as HTMLInputElement;
		const password_edit_btn = document.getElementById('password-edit-btn') as HTMLButtonElement;
		const password_update_btn = document.getElementById('password-update-btn') as HTMLButtonElement;
		const password_cancel_btn = document.getElementById('password-cancel-btn') as HTMLButtonElement;


		let old_value = password_old_check.value;
		let new_value = password_new.value;
		let confirm_value = password_confirm.value;

		// check the old value
		let res = await fetch('/api/check-given-old-password',
			{
				method: 'POST',
				headers:
				{
					'Authorization': `Bearer ${getToken()}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({password: old_value}),
			},
		);
		let data = await res.json();
		const is_verified = data.answer;
		console.log("OLD VALUE LENGTH: ", old_value.length);
		if (!is_verified)
		{
			alert('try again to write your old password!')
			return ;
		}
		if (new_value !== confirm_value)
		{
			alert('The new and confirm password are not the same');
			return ;
		}
		if (new_value.length < 6)
		{
			alert ('Try a password with more than 6 characters!');
			return ;
		}
		if (new_value === old_value)
		{
			alert('The given new password must be different than the older one');
			return ;
		}
			res = await fetch('/api/update-password',
			{
				method: 'POST',
				headers:
				{
					'Authorization': `Bearer ${getToken()}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({password: new_value}),
			},
			);
			data = await res.json();
			if (res.ok)
			{
				alert (data.message);
				password_old_check.value ='';
				password_confirm.value ='';
				password_new.value ='';
			}
			else 
				alert ('Something went wrong');
		// check if the new_value and confirm are the same with atleast 6 chars

		//------------------If everything is ok------------------
		password_old_check?.classList.add('hidden');
		password_new?.classList.add('hidden');
		password_confirm?.classList.add('hidden');
		password_update_btn?.classList.add('hidden');
		password_cancel_btn?.classList.add('hidden');
		password_edit_btn?.classList.remove('hidden');
	})
	document.getElementById('more-profiles-btn')?.addEventListener
	('click', async () =>
	{
		if (allProfiles)
		{
			// console.log("button clicked");
			allProfiles = await renderProfilesList('profiles-list', true, allProfiles, profile_offset, profile_limit);
			profile_offset += profile_limit;
		}
	});
	document.getElementById('username-edit-btn')?.addEventListener('click', ()=>
	{
		const username_par_el= document.getElementById('username') as HTMLParagraphElement;
		const username_input_el = document.getElementById('username-input') as HTMLInputElement;
		const username_edit_btn = document.getElementById('username-edit-btn') as HTMLButtonElement;
		const username_update_btn = document.getElementById('username-update-btn') as HTMLButtonElement;
		const username_cancel_btn = document.getElementById('username-cancel-btn') as HTMLButtonElement;
		
		username_input_el.value = username_par_el.textContent || '';
		username_par_el.classList.add('hidden');
		username_input_el.classList.remove('hidden');
		username_update_btn.classList.remove('hidden');
		username_cancel_btn.classList.remove('hidden');
		username_edit_btn.classList.add('hidden');
		username_input_el.focus();
	});
	document.getElementById('username-update-btn')?.addEventListener
		('click', async (e) =>
	{
		const username_update_btn = document.getElementById('username-update-btn') as HTMLButtonElement;
		const username_cancel_btn = document.getElementById('username-cancel-btn') as HTMLButtonElement;
		const username_edit_btn = document.getElementById('username-edit-btn') as HTMLButtonElement;

		const username_par_el= document.getElementById('username') as HTMLParagraphElement;
		const username_input_el = document.getElementById('username-input') as HTMLInputElement;
		const new_username = username_input_el.value.trim();
		console.log(`====> INPUT: $$${new_username}$$$`);
		console.log(`====> username_par_el: $$${username_par_el.innerText}$$$`);
		if (!/^(?=.*[a-z])[a-z0-9]+$/.test(new_username))
		{
			alert(`Username must have atleast one lowercase letter and numbers`)
			return;
		}
		try
		{
			const res = await fetch('/api/update-username',
				{
					method: 'POST',
					headers: {
								'Authorization': `Bearer ${getToken()}`,
								'Content-Type': 'application/json',
							},
					body: JSON.stringify({username: new_username}),
				},
			)
			const data = await res.json();
			if(!res.ok)
			{
				alert(data.error || 'Failed to update username');
				return
			}
			username_par_el.textContent = data.new_username;
			username_par_el.classList.remove('hidden');
			username_edit_btn.classList.remove('hidden');
			username_cancel_btn.classList.add('hidden');
			username_update_btn.classList.add('hidden');
			username_input_el.classList.add('hidden');
		}catch (e)
		{
			console.error(e);
			alert('Error updating username');
		}
	})
	document.getElementById('username-cancel-btn')?.addEventListener('click', ()=> {

		const username_edit_btn = document.getElementById('username-edit-btn');
		const username_update_btn = document.getElementById('username-update-btn');
		const username_cancel_btn = document.getElementById('username-cancel-btn');

		const username_par_el = document.getElementById('username') as HTMLParagraphElement;
		const username_input_el = document.getElementById('username-input') as HTMLInputElement;

		username_cancel_btn?.classList.add('hidden');
		username_update_btn?.classList.add('hidden');
		username_input_el.classList.add('hidden');
		username_par_el.classList.remove('hidden');
		username_edit_btn?.classList.remove('hidden');
	})
	//----------------load pagination process--------------------------------------
	document.getElementById('profiles-list')?.addEventListener
		('click', async (e) => {allProfiles = await listenerFriendAndBlock(e, 'profiles-list', false, allProfiles, profile_offset, profile_limit)});
	// console.log("allProfiles: ", allProfiles);
	document.getElementById('upload-form')?.addEventListener
		('submit', async (e) => listenerUploadPicture(e));
	document.getElementById('delete-pic-btn')?.addEventListener
		('click', async (e) => listenerDeletePicture(e));
	document.getElementById('logout-btn')?.addEventListener
		('click', async (e) => listenerLogoutBtn(e));
	//==================Linda's code==========================
		  // Fetch match history
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
				//thomas changes
				// matchContainer.innerHTML += `<h2 class="text-xl font-bold mt-6">Match History</h2>
				//   <p>No matches found.</p>`;
				matchContainer.innerHTML += `
				<p>No matches found.</p>`;
				return;
			  }
			// console.log("Matches: ", matches);
			// const wins = matches.filter(m => m.winner_id == m.id).length;
			// const matches_count = matches.length;
			// const success_rate = Math.floor((wins / matches_count) * 100) ;
			// console.log(`rate: ${success_rate} %`);
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
