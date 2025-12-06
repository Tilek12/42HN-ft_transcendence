// import { renderBackgroundFull } from '../utils/layout.js';
// import { getUser } from '../utils/auth.js'
import { renderFriendsList } from './renderFriends.js';
import { renderFriendRequestsList } from './renderFriendRequestList.js';
// import { languageStore, translations_friends_render, transelate_per_id } from './languages.js';
import { apiFetch } from '../utils/auth.js'
import { showError } from './renderProfiles.js';
// import { renderConnectionErrorPage } from './error.js';



export async function friendsRequestListener(e: Event) {
	try {
		const target = (e.target as HTMLElement).closest('button[data-profile-id]');
		if (!target)
			return;

		const profileId = target.getAttribute('data-profile-id');
		const profileAnswer = target.getAttribute('data-profile-answer');
		console.log('profileId', profileId);
		console.log("Profile answer", profileAnswer);
		if (!profileId || !profileAnswer) return;
		let res;
		if (target.classList.contains('answer-request-btn')) {
			res = await apiFetch(`/api/private/answer-request`,
				{
					method: 'POST',
					credentials: 'include',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ profileId, profileAnswer }),
				}
			)
			let data;
			try { data = await res.json(); } catch (e: any) { data = {} }
			if (!res.ok) {
				return showError('friend_requests_error', res,);
			}
			renderFriendRequestsList();
			renderFriendsList();
		}
	} catch (e: any) {
		showError('friend_requests_error', undefined, e.message + "friendsRequestListener");
	}
}

