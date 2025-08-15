import { renderBackgroundTop } from "../utils/layout";

export type Profile_details = {
	backend_url?: string;
	data_async: any;
	profile_pic_id: string;
	logged_in_id: string;
	username_id: string;
	email_id: string;
	wins_id: string;
	losses_id: string;
	trophies_id:string;
	created_at_id: string;};

export const profile_ids = (
	profile : Profile_details) =>
	{
		let logged_in = document.getElementById(profile.logged_in_id);
		let username = document.getElementById(profile.username_id);
		let email = document.getElementById(profile.email_id);
		let wins = document.getElementById(profile.wins_id);
		let losses = document.getElementById(profile.losses_id);
		let trophies = document.getElementById(profile.trophies_id);
		let created_at = document.getElementById(profile.created_at_id);
		let profile_pic = document.getElementById(profile.profile_pic_id) as HTMLImageElement;
		if(logged_in && username && email && wins && losses && trophies && created_at && profile_pic)
		{
			logged_in.innerHTML = `<strong>logged_in: </strong> ${profile.data_async.profile.logged_in === 1 ? 'yes' : 'no'}`;
			username.innerHTML = ` ${profile.data_async.user.username}`;
			email.innerHTML = `<strong>Email:</strong> ${profile.data_async.user.email}`;
			wins.innerHTML = `<strong>wins:</strong> ${profile.data_async.profile.wins}`;
			losses.innerHTML = `<strong>losses:</strong> ${profile.data_async.profile.losses}`;
			trophies.innerHTML = `<strong>trophies:</strong> ${profile.data_async.profile.trophies}`;
			created_at.innerHTML = `<strong>Joined:</strong> ${new Date(profile.data_async.user.created_at).toLocaleString()}`;

			profile_pic.src = profile.data_async.profile.image_blob ? `data:image/webp;base64,${profile.data_async.profile.image_blob}` : `${profile.backend_url}/profile_pics/${profile.data_async.profile.image_path}`;

		}
	};

export function renderUserProfile(backend_url: string, data: any)
{
	let res : string = renderBackgroundTop(`
        <div class="pt-24 max-w-xl mx-auto text-white p-6">
		<form id=upload-form>
			<h1 class="text-3xl font-bold mb-4">Your Profile</h1>
			<img id="profile_pic" src= "" alt = "First Image">
		    <input type="file" id="profile-pic-input" accept="image/*"/>
			<div class="mt-4 space-x-2">
				<button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">Update</button>
	            <button type="button" id="delete-pic-btn" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">Delete</button>
			</div>
		  </form>
		  </div>
		  <p id="logged_in"></p>
          <div class = "flex justify-center items-center mt-4 space-x-2">
					<p><strong>Username:</strong><span id="username"></span></p>
					<input
					id="username-input"
					type="text"
					class="hidden text-black border border-gray-300 rounded px-2 py-1"
					/>
					<button id="username-edit-btn" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded">Edit</button>
					<button id="username-update-btn" class="hidden px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">Update</button>
					<button id="username-cancel-btn" class="hidden px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">Cancel</button>
			</div>
          <p id="email"></p>
		  <p id="wins"></p>
		  <p id="losses"></p>
		  <p id="trophies"></p>
          <p id="created_at"></p>
		<p class="mt-4 space-x-2">
		<input id="password-old-check" type="password" placeholder="Current password"
			class=" hidden text-black border border-gray-300 rounded px-2 py-1 pr-8 w-64">
		<span id="old-tick" class="hidden absolute right-2 top-1.5 text-green-500">✔</span>
		<button type="button" data-toggle="password-old-check" class="absolute right-7 top-1.5 text-gray-500">👁</button>
		</p>

		<p class="mt-4 space-x-2">
		<input id="password-new" type="password" placeholder="New password"
			class="hidden text-black border border-gray-300 rounded px-2 py-1 pr-8 w-64">
		<button type="button" data-toggle="password-update-one" class="absolute right-2 top-1.5 text-gray-500">👁</button>
		</p>

		<p class="mt-4 space-x-2">
		<input id="password-confirm" type="password" placeholder="Confirm new password"
			class="hidden text-black border border-gray-300 rounded px-2 py-1 pr-8 w-64">
		<button type="button" data-toggle="password-update-two" class="absolute right-2 top-1.5 text-gray-500">👁</button>
		</p>

		<div class="flex justify-center items-center mt-4 space-x-2">
		<button id="password-edit-btn" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded">New Password</button>
		<button id="password-update-btn" class="hidden px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">Update</button>
		<button id="password-cancel-btn" class="hidden px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">Cancel</button>
		</div>
		  <div id="match-history" class="text-2xl text-black font-bold mb-4 bg-white p-4 rounded-xl shadow mb-2">Match History</div>
		  <div id="profiles-list"></div>
		  <button id="more-profiles-btn" class="bg-blue-600 text-white px-4 py-2 rounded">Load More</button>
          <button id="logout-btn" class="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">Logout</button>
        </div>`)

	return res;
}

