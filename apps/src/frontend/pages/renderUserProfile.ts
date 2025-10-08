import { renderBackgroundTop } from "../utils/layout";
import { wsManager } from '../websocket/ws-manager';
import type {Language} from './languages';
import {languageStore, translations_profile, transelate_per_id} from './languages'

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
export const update_langauge_headers_user_profile = (lang : Language = 'EN') =>
{
	// const your_header_profile = document.getElementById("your_profile_header") as HTMLHeadElement;
	transelate_per_id(translations_profile,"your_profile", lang, "your_profile_header");
	transelate_per_id(translations_profile,"update", lang, "image_update_button_header");
	transelate_per_id(translations_profile,"delete", lang, "image_delete_button_header");
	transelate_per_id(translations_profile,"username", lang, "username_header");
	transelate_per_id(translations_profile,"edit", lang, "edit_username_header");
	transelate_per_id(translations_profile,"update", lang, "update_username_header");
	transelate_per_id(translations_profile,"cancel", lang, "cancel_username_header");
	transelate_per_id(translations_profile,"email", lang, "email_header");
	transelate_per_id(translations_profile,"wins", lang, "wins_header");
	transelate_per_id(translations_profile,"losses", lang, "losses_header");
	transelate_per_id(translations_profile,"trophies", lang, "trophies_header");
	transelate_per_id(translations_profile,"joined", lang, "joined_header");
	transelate_per_id(translations_profile,"update", lang, "update_pass_header");
	transelate_per_id(translations_profile,"cancel", lang, "cancel_pass_header");
	transelate_per_id(translations_profile,"match_history", lang, "match_history_header");
	transelate_per_id(translations_profile,"new_password_btn", lang, "password-edit-btn");
	transelate_per_id(translations_profile,"load_more", lang, "load_more_header");
	transelate_per_id(translations_profile,"logout", lang, "logout_header");
	transelate_per_id(translations_profile,"current_password_placeholder", lang, "password-old-check");
	transelate_per_id(translations_profile,"new_password_placeholder", lang, "password-new");
	transelate_per_id(translations_profile,"confirm_new_password_placeholder", lang, "password-confirm");
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