import { renderNav } from './nav'
import { getToken, clearToken, validateLogin } from '../utils/auth'
import { renderProfilesList } from './renderProfiles';
import { renderFriendsList } from './renderFriends';

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
	  // after data is not invalid I need to 
	  // fetch from the api/profile that is fetching all the information 
	  // that I need
	  const BACKEND_URL : string = import.meta.env.VITE_BACKEND_URL;
      root.innerHTML = renderNav() + `
        <div class="max-w-xl mx-auto text-black p-6">
		<form id=upload-form>
			<h1 class="text-3xl font-bold mb-4">Your Profile</h1>
			<img src= "${BACKEND_URL}/profile_pics/${data.profile.image_path}" alt = "First Image">
		    <input type="file" id="profile-pic-input" accept="image/*"/>
			<div class="mt-4 space-x-2">
				<button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">Update</button>
	            <button type="button" id="delete-pic-btn" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">Delete</button>
			</div>
		  <form/>
		  </div>
		  <p><strong>logged_in:</strong> ${data.profile.logged_in == 1 ? 'yes' : 'no'}</p>
          <p><strong>Username:</strong> ${data.user.username}</p>
          <p><strong>Email:</strong> ${data.user.email}</p>
		  <p><strong>wins:</strong> ${data.profile.wins}</p>
		  <p><strong>losses:</strong> ${data.profile.losses}</p>
		  <p><strong>trophies:</strong> ${data.profile.trophies}</p>
          <p><strong>Joined:</strong> ${new Date(data.user.created_at).toLocaleString()}</p>
		  <div id="friends-list"></div>
		  <div id="profiles-list"></div>
          <button id="logout-btn" class="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">Logout</button>
        </div>
      `;
	renderProfilesList();
	renderFriendsList();
	//Link | Unlink | Block buttons event listeners
	document.getElementById('profiles-list')?.addEventListener
	('click', async (e) => {

		const target = e.target;
		if (!(target instanceof HTMLElement) )  return;
		console.log('clicked link');
		const profileId = target.getAttribute('data-profile-id');
		if (!profileId) return;
		let res;
		if(target.classList.contains('link-btn'))
		{
			console.log('clicked link');
			res = await fetch(`/api/link-profile`,
				{
					method: 'POST',
					headers:
					{
						'Content-Type': 'application/json',
						Authorization: `Bearer ${getToken()}`,
					}, 
					body: JSON.stringify({profileId}),
				}
			)
		}
		else if(target.classList.contains('unlink-btn'))
		{
			console.log('clicked unlink');
			res = await fetch(`/api/unlink-profile`,
				{
					method: 'POST',
					headers:
					{
						'Content-Type': 'application/json',
						Authorization: `Bearer ${getToken()}`,
					}, 
					body: JSON.stringify({profileId}),
				}
			)
		}
		else if(target.classList.contains('block-btn'))
		{
			console.log('clicked block');
			res = await fetch(`/api/block-profile`,
				{
					method: 'POST',
					headers:
					{
						'Content-Type': 'application/json',
						Authorization: `Bearer ${getToken()}`,
					}, 
					body: JSON.stringify({profileId}),
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
				renderProfilesList();
			} else {
				alert(data.message || 'Failed to perform the action');
			}
		}
	})
	document.getElementById('upload-form')?.addEventListener('submit', async (e) =>
	{
		e.preventDefault();
		const fileInput : any = document.getElementById('profile-pic-input');
		const file =fileInput?.files[0];
		if (!file)
		{
			alert('Please select an image. ');
			return;
		}
		const formData = new FormData();
		formData.append('profile_pic', file);
		const res = await fetch('/api/upload_pic',
			{
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${getToken()}`,
				},
				body: formData,
			});

		const result = await res.json();
		if (res.ok)
			location.reload();
		else
			alert(result.message || 'Failed to delete profile picture');
	})
	document.getElementById('delete-pic-btn')?.addEventListener('click', async () => {

		const res = await fetch(`/api/delete_pic`,
			{
				method: 'POST',
				headers:
				{
					Authorization: `Bearer ${getToken()}`,
				}
			}
		)
		const data = await res.json();
		if (res.ok)
			location.reload();
		else
			alert(data.message || 'Failed to delete profile picture');
	})
	document.getElementById('logout-btn')?.addEventListener('click', async () =>
		{
			const token = getToken();
				await fetch('/api/logout',
					{
						method: 'POST',
						headers: {'Authorization': `Bearer ${token}`},
					});
				clearToken();
				location.hash = '#/login';
			});
	})
	.catch(() => {
	  root.innerHTML = `<p class="text-red-400">❌ Failed to fetch profile.</p>`;
	});
}

