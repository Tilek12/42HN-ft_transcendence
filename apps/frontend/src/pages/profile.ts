import { renderNav } from './nav'
import { getToken, clearToken, validateLogin } from '../utils/auth'
import { renderProfilesList } from './renderProfiles';
import { renderUserProfile, profile_ids, Profile_details} from './renderUserProfile';
import { listenerFriendAndBlock } from './ListenerProfileList';
import { listenerDeletePicture, listenerLogoutBtn, listenerUploadPicture } from './UploadProfliePictureForm';
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
	setTimeout(() => profile_ids(profile_details), 0);
	renderProfilesList('profiles-list');
	document.getElementById('profiles-list')?.addEventListener
		('click', async (e) => listenerFriendAndBlock(e));
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

