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
	  console.log(data);
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
			<button type="submit" class="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">Update Profile Picture</button>
		  <form/>
		  </div>
		  <p><strong>logged_in:</strong> ${data.profile.logged_in == 1 ? 'yes' : 'no'}</p>
          <p><strong>Username:</strong> ${data.user.username}</p>
          <p><strong>Email:</strong> ${data.user.email}</p>
		  <p><strong>wins:</strong> ${data.profile.wins}</p>
		  <p><strong>losses:</strong> ${data.profile.losses}</p>
		  <p><strong>trophies:</strong> ${data.profile.trophies}</p>
          <p><strong>Joined:</strong> ${new Date(data.user.created_at).toLocaleString()}</p>
		  <div class="friends-list">
		  </div>
          <button id="logout-btn" class="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">Logout</button>
        </div>
      `;
	// function loadProfileView(userId : number)
	// {
	// 	fetch (`/api/profile/${userId}`, {
	// 		headers: {Authorization: `Bearer ${getToken()}`}
	// 	}).then(res => res.json())
	// 	.then(data => {
	// 		root.innerHTML = `
	// 		<h1> ${data.usrname}'s Profile</h1>
	// 		<img src="/profile_pics/${data.image_path}" width= "100">
	// 		<p>Wins: ${data.wins}</p>
	// 		<p>Losses: ${data.losses}</p>
	// 		<p>Trophies: ${data.trophies}</p>
	// 		<p>Joined: ${new Date(data.created_at).toLocaleDateString()}</p>
	// 		`;
	// 	});

	// }
	// fetch('/api/friends',
	// 	{
	// 		headers: {Authorization: `Bearer ${getToken()}`}
	// 	}).then(res =>res.json())
	// 	  .then(data =>
	// 	  {
	// 		const container : any= document.querySelector('.friends-list');
	// 		container?.innerHTML = data.friends.map(friend => 
	// 			`<div class= "flex items-cneter bg-white p-4 rounded-xl shadow">
	// 				<img src= "profile_pics/${friend.image_path} class = "w-12 h-12 rounded-full mr-4">
	// 				<div>
	// 					<a href="#/profile/${friend.id}" class="text-lg front-semibold text-blue-600 hover:underline"> ${friend.username}</a>
	// 					<p class="text-sm text-gray-600> 🏆 ${friend.trophies} | ✅ ${friend.wins} | ❌ ${friend.losses}</p>
	// 				</div>
	// 			</div>`).join('');
	// 	  });
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
		console.log(result);
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

