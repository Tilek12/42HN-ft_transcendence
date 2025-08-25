import { renderBackgroundTop } from "../utils/layout";
import { wsManager } from '../websocket/ws-manager';
import type {Language} from './languages';

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

// export const updateDom = (profile : Profile_details ) =>
// {
// 	let logged_in = document.getElementById(profile.logged_in_id);
// 	let username = document.getElementById(profile.username_id);
// 	let email = document.getElementById(profile.email_id);
// 	let wins = document.getElementById(profile.wins_id);
// 	let losses = document.getElementById(profile.losses_id);
// 	let trophies = document.getElementById(profile.trophies_id);
// 	let created_at = document.getElementById(profile.created_at_id);
// 	let profile_pic = document.getElementById(profile.profile_pic_id) as HTMLImageElement;
// 	if(logged_in && username && email && wins && losses && trophies && created_at && profile_pic)
// 	{
// 		const listUsers = wsManager.presenceUserList.map((u)=> u.name);
// 		logged_in.innerHTML = `<strong>logged_in: </strong> ${listUsers.includes(profile.data_async.user.username) ? 'yes' : 'no'}`;
// 		username.innerHTML = ` ${profile.data_async.user.username}`;
// 		email.innerHTML = `<strong>Email:</strong> ${profile.data_async.user.email}`;
// 		wins.innerHTML = `<strong>wins:</strong> ${profile.data_async.profile.wins}`;
// 		losses.innerHTML = `<strong>losses:</strong> ${profile.data_async.profile.losses}`;
// 		trophies.innerHTML = `<strong>trophies:</strong> ${profile.data_async.profile.trophies}`;
// 		created_at.innerHTML = `<strong>Joined:</strong> ${new Date(profile.data_async.user.created_at).toLocaleString()}`;

// 		profile_pic.src = profile.data_async.profile.image_blob ? `data:image/webp;base64,${profile.data_async.profile.image_blob}` : `${profile.backend_url}/profile_pics/${profile.data_async.profile.image_path}`;

// 	}
// 	requestAnimationFrame(()=>updateDom(profile));
// }
let lastPresence: string[] | undefined =[];

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
			function render() {
				const listUsers :any[] | undefined = wsManager.presenceUserList.map((u)=> u.name);
				let logged_in = document.getElementById(profile.logged_in_id);
				if (logged_in)
				{
					if(JSON.stringify(listUsers) !== JSON.stringify(lastPresence))
					{
						lastPresence = [...listUsers];
						logged_in.innerHTML += ` ${listUsers.includes(profile.data_async.user.username) ? 'yes' : 'no'}`;
					}
				}
				setTimeout(render, 500);
			// console.log("LAST PRESENCEEEEEE++>>", lastPresence);
			}
			render();
			username.innerHTML = ` ${profile.data_async.user.username}`;
			email.innerHTML += ` ${profile.data_async.user.email}`;
			wins.innerHTML += ` ${profile.data_async.profile.wins}`;
			losses.innerHTML += ` ${profile.data_async.profile.losses}`;
			trophies.innerHTML += ` ${profile.data_async.profile.trophies}`;
			created_at.innerHTML += ` ${new Date(profile.data_async.user.created_at).toLocaleString()}`;

			profile_pic.src = profile.data_async.profile.image_blob ? `data:image/webp;base64,${profile.data_async.profile.image_blob}` : `${profile.backend_url}/profile_pics/${profile.data_async.profile.image_path}`;

		}
	};

export function renderUserProfile(backend_url: string, data: any)
{
	const select = document.getElementById('language-select') as HTMLSelectElement; 
	const lang = select.value;

	// I can have an obj with keyes the language value
	const translations: Record<Language, {[key: string]: string}> = 
	{
		EN: {
			your_profile: 'Your Profile',
			update: 'Update',
			delete: 'Delete',
			edit: 'Edit',
			cancel: 'Cancel',
			logged_in: 'Logged in',
			username: 'Username',
			email: 'Email',
			wins: 'wins',
			losses: 'losses',
			trophies: 'trophies',
			joined: 'Joined',
			current_password: 'Current password',
			new_password: 'New password',
			confirm_new_password: 'Confirm new password',
			new_password_btn: 'New Password',
			match_history: 'Match History',
			load_more: 'Load More',
			logout: 'Logout'
		},
		DE: {
			your_profile: 'Dein Profil',
			update: 'Aktualisieren',
			delete: 'Löschen',
			edit: 'Bearbeiten',
			cancel: 'Abbrechen',
			logged_in: 'Eingeloggt',
			username: 'Benutzername',
			email: 'E-Mail',
			wins: 'Siege',
			losses: 'Niederlagen',
			trophies: 'Trophäen',
			joined: 'Beigetreten',
			current_password: 'Aktuelles Passwort',
			new_password: 'Neues Passwort',
			confirm_new_password: 'Neues Passwort bestätigen',
			new_password_btn: 'Neues Passwort',
			match_history: 'Spielverlauf',
			load_more: 'Mehr laden',
			logout: 'Abmelden'
		  },
		  GR: {
			your_profile: 'Το προφίλ σας',
			update: 'Ενημέρωση',
			delete: 'Διαγραφή',
			edit: 'Επεξεργασία',
			cancel: 'Ακύρωση',
			logged_in: 'Συνδεδεμένος',
			username: 'Όνομα χρήστη',
			email: 'Ηλεκτρονικό ταχυδρομείο',
			wins: 'Νίκες',
			losses: 'Ήττες',
			trophies: 'Τρόπαια',
			joined: 'Εγγράφηκε',
			current_password: 'Τρέχων κωδικός',
			new_password: 'Νέος κωδικός',
			confirm_new_password: 'Επιβεβαίωση νέου κωδικού',
			new_password_btn: 'Νέος Κωδικός',
			match_history: 'Ιστορικό αγώνων',
			load_more: 'Φόρτωση περισσότερων',
			logout: 'Αποσύνδεση'
		  }
	}
	let res : string = renderBackgroundTop(`
        <div class="pt-24 max-w-xl mx-auto text-white p-6">
		<form id=upload-form>
			<h1 class="text-3xl font-bold mb-4">${translations[lang]!.your_profile}</h1>
			<img id="profile_pic" src= "" alt = "First Image">
		    <input type="file" id="profile-pic-input" accept="image/*"/>
			<div class="mt-4 space-x-2">
				<button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">${translations[lang]!.update}</button>
	            <button type="button" id="delete-pic-btn" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">${translations[lang]!.delete}</button>
			</div>
		  </form>
		  </div>
		  <p id="logged_in"><strong>${translations[lang]!.logged_in}: </strong> </p>
          <div class = "flex justify-center items-center mt-4 space-x-2">
					<p><strong>${translations[lang]!.username}:</strong><span id="username"></span></p>
					<input
					id="username-input"
					type="text"
					class="hidden text-black border border-gray-300 rounded px-2 py-1"
					/>
					<button id="username-edit-btn" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded">${translations[lang]!.edit}</button>
					<button id="username-update-btn" class="hidden px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">${translations[lang]!.update}</button>
					<button id="username-cancel-btn" class="hidden px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">${translations[lang]!.cancel}</button>
			</div>
          <p id="email"><strong>${translations[lang]!.edit}:</strong></p>
		  <p id="wins"><strong>${translations[lang]!.wins}:</strong></p>
		  <p id="losses"><strong>${translations[lang]!.losses}:</strong></p>
		  <p id="trophies"><strong>${translations[lang]!.trophies}:</strong></p>
          <p id="created_at"><strong>${translations[lang]!.joined}:</strong></p>
		<p class="mt-4 space-x-2">
		<input id="password-old-check" type="password" placeholder="${translations[lang]!.current_password}"
			class=" hidden text-black border border-gray-300 rounded px-2 py-1 pr-8 w-64">
		<span id="old-tick" class="hidden absolute right-2 top-1.5 text-green-500">✔</span>
		<button type="button" data-toggle="password-old-check" class="absolute right-7 top-1.5 text-gray-500">👁</button>
		</p>

		<p class="mt-4 space-x-2">
		<input id="password-new" type="password" placeholder="${translations[lang]!.new_password}"
			class="hidden text-black border border-gray-300 rounded px-2 py-1 pr-8 w-64">
		<button type="button" data-toggle="password-update-one" class="absolute right-2 top-1.5 text-gray-500">👁</button>
		</p>

		<p class="mt-4 space-x-2">
		<input id="password-confirm" type="password" placeholder="${translations[lang]!.confirm_new_password}"
			class="hidden text-black border border-gray-300 rounded px-2 py-1 pr-8 w-64">
		<button type="button" data-toggle="password-update-two" class="absolute right-2 top-1.5 text-gray-500">👁</button>
		</p>

		<div class="flex justify-center items-center mt-4 space-x-2">
		<button id="password-edit-btn" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded">${translations[lang]!.new_password_btn}</button>
		<button id="password-update-btn" class="hidden px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">${translations[lang]!.udpate}</button>
		<button id="password-cancel-btn" class="hidden px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">${translations[lang]!.cancel}</button>
		</div>
		  <div id="match-history" class="text-2xl text-black font-bold mb-4 bg-white p-4 rounded-xl shadow mb-2">${translations[lang]!.match_history}</div>
		  <div id="profiles-list"></div>
		  <button id="more-profiles-btn" class="bg-blue-600 text-white px-4 py-2 rounded">${translations[lang]!.load_more}</button>
          <button id="logout-btn" class="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">${translations[lang]!.logout}</button>
        </div>`)
		// requestAnimationFrame(()=>renderUserProfile(backend_url,data));
	return res;
}

