
import { getUser} from '../utils/auth.js'


const asyncFriendRequestHandler = async (endpoint: string, profile_id:string ) =>
{
	try {
	let res : any;
	// console.log(`clicked ${attributes.testing_attribute}`)
	res = await fetch(`/api/private/${endpoint}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ profileId: profile_id }), // ✅ correct shape
	});
	return res;
	}
	catch(e:any)
	{}
}
export const listenerFriendAndBlock = async (event : any, element_id : string, load: boolean = false,  allProfiles: {profiles: any[]}[] | undefined, offset:number, limit:number) : Promise<any[] | undefined>=>
{
	// console.log("clicked the listenerFriendAndBlock");
	const target = event.target;
	if (!(target instanceof HTMLElement) )  return;
	const profileId = target.getAttribute('data-profile-id');
	if (!profileId) return;
	let res;
	const user = getUser();
	if(target.classList.contains('link-btn'))
	{
		res = await asyncFriendRequestHandler(`link-profile`, profileId);
	}
	else if(target.classList.contains('pending-btn'))
	{
		res = await asyncFriendRequestHandler(`pending-request`, profileId);
	}
	else if(target.classList.contains('unlink-btn'))
	{
		res = await asyncFriendRequestHandler(`unlink-profile`, profileId);
	}
	else if(target.classList.contains('block-btn'))
	{
		res = await asyncFriendRequestHandler(`block-profile`, profileId);
	}
	else if(target.classList.contains('unblock-btn'))
	{
		res = await asyncFriendRequestHandler(`unblock-profile`, profileId);
		// console.log('clicked unblock');
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
			// I need the Id as offeset and as limit 1 and I ll replace the updated version with the all one
			// return renderProfilesList(element_id, false, allProfiles, offset, limit, true);
		} else {
			alert(data.message || 'Failed to perform the action');
		}
	}
} 
/// P: WTF is this ?????

