import { renderNav } from './nav'
import { renderBackgroundTop } from '../utils/layout'
import { getToken, clearToken, validateLogin } from '../utils/auth'
import { renderProfilesList } from './renderProfiles';
import { renderUserProfile, profile_ids, Profile_details} from './renderUserProfile';
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
		data_async: data,
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
			  console.log("data: ", data);
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
