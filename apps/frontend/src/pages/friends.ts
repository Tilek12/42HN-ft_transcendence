import { renderNav } from './nav'
import { getToken, clearToken, validateLogin } from '../utils/auth'
import { renderProfilesList } from './renderProfiles';
import { renderFriendsList } from './renderFriends';
import { renderFriendRequestsList } from './renderFriendRequestList';
import { getEnvVariable } from './TypeSafe';

export async function renderFriends(root: HTMLElement) {
  const isValid = await validateLogin()
  if (!isValid) {
	location.hash = '#/login'
	return;
  }
	  root.innerHTML = renderNav() + `
		<div class="max-w-xl mx-auto text-black p-6">
		  <div id="friends-list"></div>
		  <button id="more-friends-btn" class="bg-blue-600 text-white px-4 py-2 rounded">Load More</button>
		  <div id="friend-requests-list"></div>
		  <button id="more-friend-requests-btn" class="bg-blue-600 text-white px-4 py-2 rounded">Load More</button>
		</div>
	  `;
	//----------------load pagination process--------------------------------------
	// let allProfiles: {profiles : any[]}[] | undefined= [];
	// let profile_offset = 0;
	// let profile_limit = 1;
	// setTimeout(() => profile_ids(profile_details), 0);
	// (async () =>{
	// 	allProfiles = await  renderProfilesList('profiles-list', undefined, allProfiles, profile_offset, profile_limit);
	// })()
	// document.getElementById('more-profiles-btn')?.addEventListener
	// 	('click', async () => 
	// 	{
	// 		if (allProfiles)
	// 		{
	// 			allProfiles = await renderProfilesList('profiles-list', true, allProfiles, profile_offset, profile_limit);
	// 			profile_offset += profile_limit;
	// 		}
	// 	});
	//----------------load pagination process--------------------------------------
	renderFriendsList();
	renderFriendRequestsList();
	document.getElementById('friend-requests-list')?.addEventListener(

		'click', async (e) => 
		{
			const target = e.target;
			if (!(target instanceof HTMLElement)) return;
			const profileId = target.getAttribute('data-profile-id');
			const profileAnswer = target.getAttribute('data-profile-answer');
			console.log("profileId and Profile answer")
			console.log(profileId, profileAnswer);
			if (!profileId || !profileAnswer) return;
			let res;
			if (target.classList.contains('answer-request-btn'))
			{
				console.log('answer clicked');
				res = await fetch(`/api/answer-request`,
					{
						method: 'POST',
						headers:
						{
							'Content-Type': 'application/json',
							Authorization : `Bearer ${getToken()}`,
						},
						body: JSON.stringify({profileId, profileAnswer}),
					}
				)
			}
			if (res) {
				let data;
				try {
					const text = await res.text();
					data = text ? JSON.parse(text) : {};
				} catch (err) {
					console.error("Failed to parse JSON:", err);
					data = {};
				}
			
				if (res.ok) {
					renderFriendsList();
					renderFriendRequestsList();
				} else {
					alert(data.message || 'Failed to perform the action');
				}
			}
		}
	)
}
