
import { apiFetch, getUser } from '../utils/auth.js'
import { fetchProfiles, renderProfiles, showError } from './renderProfiles.js'
// import { renderProfilesList } from './renderProfiles.js';


const asyncFriendRequestHandler = async (endpoint: string, profile_id: string) => {
	try {
		let res: any;
		// console.log(`clicked ${attributes.testing_attribute}`)
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
export const listenerFriendAndBlock = async (event: any): Promise<any[] | undefined> => {
	// console.log("clicked the listenerFriendAndBlock");
	try {
		const target = event.target;
		if (!(target instanceof HTMLElement))
			return;
		const profileId = target.getAttribute('data-profile-id');
		if (!profileId)
			return;
		let res: Response | undefined;
		if (target.classList.contains('link-btn')) {
			res = await asyncFriendRequestHandler(`link-profile`, profileId);
		}
		else if (target.classList.contains('pending-btn')) {
			res = await asyncFriendRequestHandler(`pending-request`, profileId);
		}
		else if (target.classList.contains('unlink-btn')) {
			res = await asyncFriendRequestHandler(`unlink-profile`, profileId);
		}
		else if (target.classList.contains('block-btn')) {
			res = await asyncFriendRequestHandler(`block-profile`, profileId);
		}
		else if (target.classList.contains('unblock-btn')) {
			res = await asyncFriendRequestHandler(`unblock-profile`, profileId);
			// console.log('clicked unblock');
		}
		if (res) {
			let data;

			data = await res.json();
			if (res.ok) {
				fetchProfiles();
				renderProfiles();
			} else {
				showError('user_list_error', res, "");
			}
		}
	} catch (e:any) {
		showError('user_list_error', undefined, e.message + " AHA")

	}
}


