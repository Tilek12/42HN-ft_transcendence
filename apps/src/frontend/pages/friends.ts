import { renderBackgroundFull } from '../utils/layout.js';
import { getUser } from '../utils/auth.js'
import { renderFriendsList } from './renderFriends.js';
import { renderFriendRequestsList } from './renderFriendRequestList.js';
import {languageStore, translations_friends_render, transelate_per_id} from './languages.js';
import { apiFetch } from '../utils/auth.js'



export async function friendsRequestListener() {


	document.getElementById('friend-requests-list')?.addEventListener(

		'click', async (e) =>
		{
			const target = e.target;
			if (!(target instanceof HTMLElement)) return;
			const profileId = target.getAttribute('data-profile-id');
			const profileAnswer = target.getAttribute('data-profile-answer');
			// console.log("profileId and Profile answer")
			// console.log(profileId, profileAnswer);
			if (!profileId || !profileAnswer) return;
			let res;
			if (target.classList.contains('answer-request-btn'))
			{
				// console.log('answer clicked');
				res = await apiFetch(`/api/private/answer-request`,
					{
						method: 'POST',
						credentials: 'include',
						headers:{ 'Content-Type': 'application/json'},
						body: JSON.stringify({profileId, profileAnswer}),
					}
				)
			}
			if (res) {
				let data;
				try {
					data = await res.json();
				} catch (err) {
					console.error("Failed to parse JSON:", err);
					data = {};
				}

				if (res.ok) {
					renderFriendsList('friends-list');
					renderFriendRequestsList();
				} else {
					alert(data.message || 'Failed to perform the action');
				}
			}
		}
	)
}
