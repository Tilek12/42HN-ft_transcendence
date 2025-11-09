
import { getToken} from '../utils/auth.js'



export type friendRequestAttributes =
{
	res_async : any;
	testing_attribute: string;
	api_endpoint : string;
	token_jwt : any,
	profile_id: string;
}
const asyncFriendRequestHandler = async (attributes : friendRequestAttributes) =>
{
	let res : any;
	// console.log(`clicked ${attributes.testing_attribute}`)
	res = await fetch(`/api/private/${attributes.api_endpoint}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${attributes.token_jwt}`,
			},
			body: JSON.stringify({ profileId: attributes.profile_id }), // ✅ correct shape
	});
	return res;
}
export const listenerFriendAndBlock = async (event : any, element_id : string, load: boolean = false,  allProfiles: {profiles: any[]}[] | undefined, offset:number, limit:number) : Promise<any[] | undefined>=>
{
	// console.log("clicked the listenerFriendAndBlock");
	const target = event.target;
	if (!(target instanceof HTMLElement) )  return;
	const profileId = target.getAttribute('data-profile-id');
	if (!profileId) return;
	let res;
	const token = getToken();
	if(target.classList.contains('link-btn'))
	{
		res = await asyncFriendRequestHandler({res_async: res, testing_attribute: `link`,
			api_endpoint: `link-profile`, token_jwt:  token, profile_id: profileId});
	}
	else if(target.classList.contains('pending-btn'))
	{
		res = await asyncFriendRequestHandler({res_async: res, testing_attribute: `pending`,
			api_endpoint: `pending-request`, token_jwt:  token, profile_id: profileId});
	}
	else if(target.classList.contains('unlink-btn'))
	{
		res = await asyncFriendRequestHandler({res_async: res, testing_attribute: `unlink`,
			api_endpoint: `unlink-profile`, token_jwt:  token, profile_id: profileId});
	}
	else if(target.classList.contains('block-btn'))
	{
		res = await asyncFriendRequestHandler({res_async: res, testing_attribute: `block`,
			api_endpoint: `block-profile`, token_jwt:  token, profile_id: profileId});
	}
	else if(target.classList.contains('unblock-btn'))
	{
		res = await asyncFriendRequestHandler({res_async: res, testing_attribute: `unblock`,
			api_endpoint: `unblock-profile`, token_jwt:  token, profile_id: profileId});
		// console.log('clicked unblock');
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
			// I need the Id as offeset and as limit 1 and I ll replace the updated version with the all one
			// return renderProfilesList(element_id, false, allProfiles, offset, limit, true);
		} else {
			alert(data.message || 'Failed to perform the action');
		}
	}
}
