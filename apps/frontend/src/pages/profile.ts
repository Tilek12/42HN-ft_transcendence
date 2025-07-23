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
      root.innerHTML = renderNav() + `
        <div class="max-w-xl mx-auto text-black p-6">
          <h1 class="text-3xl font-bold mb-4">Your Profile</h1>
		  <p><strong>logged_in:</strong> ${data.profile.logged_in == 1 ? 'yes' : 'no'}</p>
          <p><strong>Username:</strong> ${data.user.username}</p>
          <p><strong>Email:</strong> ${data.user.email}</p>
		  <p><strong>wins:</strong> ${data.profile.wins}</p>
		  <p><strong>losses:</strong> ${data.profile.losses}</p>
		  <p><strong>trophies:</strong> ${data.profile.trophies}</p>
          <p><strong>Joined:</strong> ${new Date(data.user.created_at).toLocaleString()}</p>
          <button id="logout-btn" class="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">Logout</button>
        </div>
      `;
    //   document.getElementById('logout-btn')?.addEventListener('click', () => {
    //     clearToken();
    //     location.hash = '#/login';
    //   });
    // })
    // .catch(() => {
    //   root.innerHTML = `<p class="text-red-400">❌ Failed to fetch profile.</p>`;
    // });
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

