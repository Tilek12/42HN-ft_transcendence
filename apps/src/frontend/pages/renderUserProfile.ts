import { renderBackgroundTop } from "../utils/layout";
import { wsManager } from '../websocket/ws-manager';
import type {Language} from './languages';

export const translations_profile: Record<Language, {[key: string]: string | undefined}> = 
{
	EN: {
		your_profile : 'Your Profile',
		update : 'Update',
		delete : 'Delete',
		edit : 'Edit',
		cancel : 'Cancel',
		logged_in : 'Logged in',
		username : 'Username',
		email : 'Email',
		wins : 'wins',
		losses : 'losses',
		trophies : 'trophies',
		joined : 'Joined',
		current_password : 'Current password',
		new_password: 'New Password',
		confirm_new_password: 'Confirm New Passsword',
		new_password_btn : 'New Password',
		match_history : 'Match History',
		load_more : 'Load More',
		logout : 'Logout'
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
		email: 'Ημέιλ',
		wins: 'Νίκες',
		losses: 'Ήττες',
		trophies: 'Τρόπαια',
		joined: 'Εγγράφηκε',
		current_password: 'Τρέχων κωδικός',
		new_password: 'Νέος κωδικός',
		confirm_new_password: 'Επιβεβαίωση νέου κωδικού',
		new_password_btn: 'Νέος Κωδικός',
		match_history: 'Ιστορικό αγώνων',
		load_more: 'Περισσότερα Προφίλ',
		logout: 'Αποσύνδεση'
	  }
}

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
						// logged_in.innerHTML = ` ${listUsers.includes(profile.data_async.user.username) ? 'yes' : 'no'}`;
					}
				}
				setTimeout(render, 500);
			// console.log("LAST PRESENCEEEEEE++>>", lastPresence);
			}
			render();
			username.innerHTML = ` ${profile.data_async.user.username}`;
			email.innerHTML = ` ${profile.data_async.user.email}`;
			wins.innerHTML = ` ${profile.data_async.profile.wins}`;
			losses.innerHTML = ` ${profile.data_async.profile.losses}`;
			trophies.innerHTML = ` ${profile.data_async.profile.trophies}`;
			created_at.innerHTML += ` ${new Date(profile.data_async.user.created_at).toLocaleString()}`;

			profile_pic.src = profile.data_async.profile.image_blob ? `data:image/webp;base64,${profile.data_async.profile.image_blob}` : `${profile.backend_url}/profile_pics/${profile.data_async.profile.image_path}`;

		}
	};
export const update_langauge_headers_user_profile = (lang  = 'EN') =>
{
	// const your_header_profile = document.getElementById("your_profile_header") as HTMLHeadElement;
	const yourProfileHeaderEl = document.getElementById("your_profile_header");
	if (yourProfileHeaderEl) yourProfileHeaderEl.innerHTML = translations_profile[lang].your_profile;
	
	const imageUpdateButtonHeaderEl = document.getElementById("image_update_button_header");
	if (imageUpdateButtonHeaderEl) imageUpdateButtonHeaderEl.innerHTML = translations_profile[lang].update;
	
	const imageDeleteButtonHeaderEl = document.getElementById("image_delete_button_header");
	if (imageDeleteButtonHeaderEl) imageDeleteButtonHeaderEl.innerHTML = translations_profile[lang]!.delete;
	
	const usernameHeaderEl = document.getElementById("username_header");
	if (usernameHeaderEl) usernameHeaderEl.innerHTML = translations_profile[lang].username + ":";
	
	const editUsernameHeaderEl = document.getElementById("edit_username_header");
	if (editUsernameHeaderEl) editUsernameHeaderEl.innerHTML = translations_profile[lang].edit;
	
	const updateUsernameHeaderEl = document.getElementById("update_username_header");
	if (updateUsernameHeaderEl) updateUsernameHeaderEl.innerHTML = translations_profile[lang].update;
	
	const cancelUsernameHeaderEl = document.getElementById("cancel_username_header");
	if (cancelUsernameHeaderEl) cancelUsernameHeaderEl.innerHTML = translations_profile[lang].cancel;
	
	const emailHeaderEl = document.getElementById("email_header");
	if (emailHeaderEl) emailHeaderEl.innerHTML = translations_profile[lang].email + ":";
	
	const winsHeaderEl = document.getElementById("wins_header");
	if (winsHeaderEl) winsHeaderEl.innerHTML = translations_profile[lang].wins + ":";
	
	const lossesHeaderEl = document.getElementById("losses_header");
	if (lossesHeaderEl) lossesHeaderEl.innerHTML = translations_profile[lang].losses + ":";
	
	const trophiesHeaderEl = document.getElementById("trophies_header");
	if (trophiesHeaderEl) trophiesHeaderEl.innerHTML = translations_profile[lang].trophies + ":";
	
	const joinedHeaderEl = document.getElementById("joined_header");
	if (joinedHeaderEl) joinedHeaderEl.innerHTML = translations_profile[lang].joined + ":";
	
	const updatePassHeaderEl = document.getElementById("update_pass_header");
	if (updatePassHeaderEl) updatePassHeaderEl.innerHTML = translations_profile[lang].update;
	
	const cancelPassHeaderEl = document.getElementById("cancel_pass_header");
	if (cancelPassHeaderEl) cancelPassHeaderEl.innerHTML = translations_profile[lang].cancel;
	
	const matchHistoryHeaderEl = document.getElementById("match_history_header");
	if (matchHistoryHeaderEl) matchHistoryHeaderEl.innerHTML = translations_profile[lang].match_history;
	
	const passwordEditBtnEl = document.getElementById("password-edit-btn");
	if (passwordEditBtnEl) passwordEditBtnEl.innerHTML = translations_profile[lang].new_password_btn;
	
	const loadMoreHeaderEl = document.getElementById("load_more_header");
	if (loadMoreHeaderEl) loadMoreHeaderEl.innerHTML = translations_profile[lang].load_more;
	
	const logoutHeaderEl = document.getElementById("logout_header");
	if (logoutHeaderEl) logoutHeaderEl.innerHTML = translations_profile[lang].logout;

	const oldCheckEl = document.getElementById("password-old-check") as HTMLInputElement | null;
	if (oldCheckEl) oldCheckEl.placeholder = translations_profile[lang].current_password;
	
	const newPassEl = document.getElementById("password-new") as HTMLInputElement | null;
	if (newPassEl) newPassEl.placeholder = translations_profile[lang].new_password;
	
	const confirmPassEl = document.getElementById("password-confirm") as HTMLInputElement | null;
	if (confirmPassEl) confirmPassEl.placeholder = translations_profile[lang].confirm_new_password;
}
export function renderUserProfile(backend_url: string, data: any, lang = 'EN')
{
	// const select = document.getElementById('language-select') as HTMLSelectElement; 
	// const lang = select.value;
	// console.log("inside of renderer=========================", data);
	// I can have an obj with keyes the language value
	// let new_value = document.getElementById('language-select').value;
	// let old_value_of_language = 'DE';
	// console.log(new_value);
	// if(new_value !== old_value_of_language)
	// 	console.log('!!!!!!!!!!!!!!!!!!!!yes');
	// update_langauge_headers_user_profile(lang);
	let res : string = renderBackgroundTop(`
        <div class="pt-24 max-w-xl mx-auto text-white p-6">
		<form id=upload-form>
			<h1 id="your_profile_header"class="text-3xl font-bold mb-4"></h1>
			<img id="profile_pic" src= "" alt = "First Image">
		    <input type="file" id="profile-pic-input" accept="image/*"/>
			<div class="mt-4 space-x-2">
				<button id="image_update_button_header"type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"></button>
	            <button id="image_delete_button_header" type="button" id="delete-pic-btn" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"></button>
			</div>
		  </form>
		  </div>
		  <div><strong></strong><p id="logged_in"></p></div>
          <div class = "flex justify-center items-center mt-4 space-x-2">
					<p><strong id="username_header">:</strong><span id="username"></span></p>
					<input
					id="username-input"
					type="text"
					class="hidden text-black border border-gray-300 rounded px-2 py-1"
					/>
					<button id="username-edit-btn" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"><span id="edit_username_header"></span></button>
					<button id="username-update-btn" class="hidden px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"><span id="update_username_header"></span></button>
					<button id="username-cancel-btn" class="hidden px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"><span id="cancel_username_header"></span></button>
			</div>
          <div class = "flex justify-center items-center mt-4 space-x-2"><strong id="email_header">:</strong><p id="email"></p></div>
		  <div class = "flex justify-center items-center mt-4 space-x-2"><strong id="wins_header">:</strong><p id="wins"></p></div>
		   <div class = "flex justify-center items-center mt-4 space-x-2"><strong id="losses_header">:</strong><p id="losses"></p></div>
		  <div class = "flex justify-center items-center mt-4 space-x-2"><strong id="trophies_header">:</strong><p id="trophies"></p></div>
       <div class = "flex justify-center items-center mt-4 space-x-2"> <strong id="joined_header">:</strong><p id="created_at"></p></div>
		<p class="mt-4 space-x-2">
		<input id="password-old-check" type="password" placeholder=""
			class=" hidden text-black border border-gray-300 rounded px-2 py-1 pr-8 w-64">
		<span id="old-tick" class="hidden absolute right-2 top-1.5 text-green-500">✔</span>
		<button type="button" data-toggle="password-old-check" class="absolute right-7 top-1.5 text-gray-500">👁</button>
		</p>

		<p class="mt-4 space-x-2">
		<input id="password-new" type="password" placeholder=""
			class="hidden text-black border border-gray-300 rounded px-2 py-1 pr-8 w-64">
		<button type="button" data-toggle="password-update-one" class="absolute right-2 top-1.5 text-gray-500">👁</button>
		</p>

		<p class="mt-4 space-x-2">
		<input id="password-confirm" type="password" placeholder=""
			class="hidden text-black border border-gray-300 rounded px-2 py-1 pr-8 w-64">
		<button type="button" data-toggle="password-update-two" class="absolute right-2 top-1.5 text-gray-500">👁</button>
		</p>

		<div class="flex justify-center items-center mt-4 space-x-2">
		<button id="password-edit-btn" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"></button>
		<button id="password-update-btn" class="hidden px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"><span id="update_pass_header"></span></button>
		<button id="password-cancel-btn" class="hidden px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"><span id="cancel_pass_header"></span></button>
		</div>
		  <div id="match-history" class="text-2xl text-black font-bold mb-4 bg-white p-4 rounded-xl shadow mb-2"><span id="match_history_header"></span></div>
		  <div id="profiles-list"></div>
		  <button id="more-profiles-btn" class="bg-blue-600 text-white px-4 py-2 rounded"><span id="load_more_header"></span></button>
          <button id="logout-btn" class="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"><span id="logout_header"></span></button>
        </div>`)
		// requestAnimationFrame(()=>renderUserProfile(backend_url,data));
	return res;
}