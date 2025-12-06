
import { apiFetch, getUser } from '../utils/auth.js'
import { renderProfile } from './profile.js';
import { showError } from './renderProfiles.js';




const asyncFriendRequestHandler = async (endpoint: string, profile_id: string) => {
	try {
		let res: any;
		res = await apiFetch(`/api/private/${endpoint}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ profileId: profile_id }), // ✅ correct shape
		});
		return res;
	}
	catch (e: any) {
		showError('user_list_error', undefined, e.message + "LOL");
		return undefined;
	}
}

export const listenerFriendAndBlock = async (event: Event) => {

	try {
		const target = (event.target as HTMLElement).closest('button[data-profile-id]');
		if (!target)
			return;

		const profileId = target.getAttribute('data-profile-id');
		if (!profileId)
			return;
		console.log("profileId:", profileId);

		let res: Response | undefined;
		if (target.classList.contains('link-btn')) {
			console.log("link-btn");
			res = await asyncFriendRequestHandler(`link-profile`, profileId);
		}
		else if (target.classList.contains('pending-btn')) {
			console.log("pending-btn");
			res = await asyncFriendRequestHandler(`pending-request`, profileId);
		}
		else if (target.classList.contains('unlink-btn')) {
			console.log("unlink-btn");
			res = await asyncFriendRequestHandler(`unlink-profile`, profileId);
		}
		else if (target.classList.contains('block-btn')) {
			console.log("block-btn");
			res = await asyncFriendRequestHandler(`block-profile`, profileId);
		}
		else if (target.classList.contains('unblock-btn')) {
			console.log("unblock-btn");
			res = await asyncFriendRequestHandler(`unblock-profile`, profileId);
			// console.log('clicked unblock');
		}
		if (res) {
			if (res.ok) {

			} else {
				showError('user_list_error', res, "");
			}
		}
		renderProfile(document.getElementById('app')!)
	} catch (e: any) {

		showError('user_list_error', undefined, e.message + event.target)
	}
}


