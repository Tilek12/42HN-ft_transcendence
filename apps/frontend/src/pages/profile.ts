import { renderNav } from './nav'
import { getToken, clearToken, validateLogin } from '../utils/auth'
import { renderProfilesList } from './renderProfiles';
import { renderUserProfile, profile_ids, Profile_details} from './renderUserProfile';
import { listenerFriendAndBlock } from './listenerProfileList';
import { listenerDeletePicture, listenerLogoutBtn, listenerUploadPicture } from './listenerUploadAndDeletePicture';
import { getEnvVariable } from './TypeSafe';

export async function renderProfile(root: HTMLElement) {
  const isValid = await validateLogin()
  if (!isValid) {
    location.hash = '#/login'
    return;
  }
  
  root.innerHTML = renderNav() + `<div class="text-center">Loading profile...</div>`

  fetch('/api/profile', {
    method: 'POST',
	headers: {'Authorization': `Bearer ${getToken()}`}
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
	// console.log("allProfiles: ", allProfiles);
	document.getElementById('more-profiles-btn')?.addEventListener
		('click', async () => 
		{
			if (allProfiles)
			{
				console.log("button clicked");
				allProfiles = await renderProfilesList('profiles-list', true, allProfiles, profile_offset, profile_limit);
				profile_offset += profile_limit;
			}
		});
	//----------------load pagination process--------------------------------------
	document.getElementById('profiles-list')?.addEventListener
		('click', async (e) => {allProfiles = await listenerFriendAndBlock(e, 'profiles-list', false, allProfiles, profile_offset, profile_limit)});
	document.getElementById('upload-form')?.addEventListener
		('submit', async (e) => listenerUploadPicture(e));
	document.getElementById('delete-pic-btn')?.addEventListener
		('click', async (e) => listenerDeletePicture(e));
	document.getElementById('logout-btn')?.addEventListener
		('click', async (e) => listenerLogoutBtn(e));
	})
	.catch(() => {
	  root.innerHTML = `<p class="text-red-400">❌ Failed to fetch profile.</p>`;
	});
}

