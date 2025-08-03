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
    headers: { 'Authorization': `Bearer ${getToken()}` }
  })
    .then(res => res.json())
    .then(data => {
      if (
        data.message === 'User or profile not found' ||
        data.message === 'Invalid or expired token'
      ) {
        clearToken();
        location.hash = '#/login';
        return;
      }

      root.innerHTML = renderNav() + `
        <div class="max-w-xl mx-auto text-black p-6">
          <h1 class="text-3xl font-bold mb-4">Your Profile</h1>
          <img src="${data.profile.path_or_url_to_image}" alt="Profile Picture">
          <input type="text" id="pic-path" placeholder="Enter the image URL or path" />
          <button id="update-pic-btn" class="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">Update</button>
          <button id="delete-pic-btn" class="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">Delete</button>
          <p><strong>logged_in:</strong> ${data.profile.logged_in == 1 ? 'yes' : 'no'}</p>
          <p><strong>Username:</strong> ${data.user.username}</p>
          <p><strong>Email:</strong> ${data.user.email}</p>
          <p><strong>wins:</strong> ${data.profile.wins}</p>
          <p><strong>losses:</strong> ${data.profile.losses}</p>
          <p><strong>trophies:</strong> ${data.profile.trophies}</p>
          <p><strong>Joined:</strong> ${new Date(data.user.created_at).toLocaleString()}</p>
          <div id="match-history" class="mt-6"></div>
          <button id="logout-btn" class="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">Logout</button>
        </div>
      `;

      // Event listeners
      document.getElementById('update-pic-btn')?.addEventListener('click', async () => {
        const input = document.getElementById('pic-path') as HTMLInputElement;
        const profilePicPath = input.value.trim();
        const token = getToken();

        if (!profilePicPath) return alert("Please enter a path.");

        const res = await fetch('/api/update_pic', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ profile_pic: profilePicPath })
        });

        const result = await res.json();
        if (res.ok)
          alert('Profile picture path updated!');
        else
          alert(result.message || 'Failed to update profile picture');
      });

      document.getElementById('logout-btn')?.addEventListener('click', async () => {
        const token = getToken();
        await fetch('/api/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        clearToken();
        location.hash = '#/login';
      });

      // Fetch match history
      fetch('/api/private/match/user', {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })
        .then(res => res.json())
        .then(matches => {
          const matchContainer = document.getElementById('match-history') as HTMLElement;
          if (!matchContainer) return;

          if (!Array.isArray(matches) || matches.length === 0) {
            matchContainer.innerHTML += `<h2 class="text-xl font-bold mt-6">Match History</h2>
              <p>No matches found.</p>`;
            return;
          }

		matchContainer.innerHTML += `
		<h2 class="text-xl font-bold mt-6 mb-2">Match History</h2>
		<div class="overflow-x-auto">
			<table class="w-full text-left border-collapse shadow rounded-lg">
			<thead class="bg-gray-100">
				<tr>
				<th class="py-2 px-4">Match ID</th>
				<th class="py-2 px-4">Opponent</th>
				<th class="py-2 px-4">Score</th>
				<th class="py-2 px-4">Result</th>
				<th class="py-2 px-4">Played At</th>
				</tr>
			</thead>
			<tbody>
				${matches.map((match, index) => `
				<tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
					<td class="py-2 px-4">${match.id}</td>
					<td class="py-2 px-4">${match.player1_id === data.user.id ? match.player2_id : match.player1_id}</td>
					<td class="py-2 px-4">
					${match.player1_id === data.user.id
						? `${match.player1_score} - ${match.player2_score}`
						: `${match.player2_score} - ${match.player1_score}`}
					</td>
					<td class="py-2 px-4">
					${match.winner_id === null
						? 'Tie'
						: match.winner_id === data.user.id ? 'Win' : 'Loss'}
					</td>
					<td class="py-2 px-4">${new Date(match.played_at).toLocaleString()}</td>
				</tr>
				`).join('')}
			</tbody>
			</table>
		</div>
		`;

        })
        .catch(err => {
          console.error('Failed to load matches:', err);
        });
    })
    .catch(() => {
      root.innerHTML = `<p class="text-red-400">❌ Failed to fetch profile.</p>`;
    });
}
