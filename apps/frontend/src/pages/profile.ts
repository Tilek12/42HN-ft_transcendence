import { renderNav } from './nav'
import { getToken, clearToken, validateLogin } from '../utils/auth'

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
          <button id="logout-btn" class="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">Logout</button>
        </div>
      `;
	(async () =>
	{
		const container = document.getElementById('friends-list');
		console.log("Here!");
		if (!container) return;
		try
		{
			const res = await fetch('/api/friends', 
				{headers: {Authorization: `Bearer ${getToken()}`}
			});
		const data = await res.json();
		container.innerHTML = data.friends.map((friend: any) => 
			`<div class = "flex items-center bg-white p-4 rounded-xl shadow mb-2">
				<img src= "${BACKEND_URL}/profile_pics/${friend.image_path}" class="w-12 h-12 rounded-full mr-4" />
			<div>
				<a href="" class="text-lg font-semibold text-blue-600 hover:underline">${friend.username}</a>
				<p class="text-sm text-gray-600"> 🏆 ${friend.trophies} | ✅ ${friend.wins} | ❌ ${friend.losses} </p>
				<span class="${friend.logged_in ? 'text-green-600' :'text-gray-500'}">
					${friend.logged_in ? 'Online' : 'Offline'}
				</span>
			</div>
			</div>`
		).join('');
		} catch (err){
			console.error('Failed to fetch friends: ', err);
			container.innerHTML = `<p class="text-red-500>Could not load friends list.</p>`
		}
	})();
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

