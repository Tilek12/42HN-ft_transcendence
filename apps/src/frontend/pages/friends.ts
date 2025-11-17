import { renderBackgroundFull, renderBackgroundTop } from '../utils/layout.js';
import { getToken } from '../utils/auth.js'
import { renderFriendsList } from './renderFriends.js';
import { renderFriendRequestsList } from './renderFriendRequestList.js';
import {languageStore, translations_friends_render, transelate_per_id} from './languages.js';



export async function renderFriends(root: HTMLElement) {

//   <button id="more-friends-btn" class="bg-blue-600 text-white px-4 py-2 rounded">Load More</button>
//   <button id="more-friend-requests-btn" class="bg-blue-600 text-white px-4 py-2 rounded">Load More</button>
	  root.innerHTML = renderBackgroundFull(`
		<div class="pt-24 max-w-xl mx-auto text-black p-6">
		  <div id="friends-list"></div>
		  <div id="friend-requests-list"></div>
		</div>
	  `);
	//----------------load for friends list----------------------------------------
	let allFriends: {friends : any[]}[] | undefined= [];
	let friends_offset = 0;
	let friends_limit = 1;

	renderFriendsList('friends-list');

	renderFriendRequestsList();
	languageStore.subscribe((lang)=>{

		transelate_per_id(translations_friends_render, "friends_list_header", lang, "friends_list_header");
		transelate_per_id(translations_friends_render, "request_list_header", lang, "request_list_header");
	}
		)
	document.getElementById('friend-requests-list')?.addEventListener(

		'click', async (e) =>
		{
			const target = e.target;
			if (!(target instanceof HTMLElement)) return;
			const profileId = target.getAttribute('data-profile-id');
			const profileAnswer = target.getAttribute('data-profile-answer');
			// console.log("profileId and Profile answer")
			// console.log(profileId, profileAnswer);
			if (!profileId || !profileAnswer) return;
			let res;
			if (target.classList.contains('answer-request-btn'))
			{
				// console.log('answer clicked');
				res = await fetch(`/api/private/answer-request`,
					{
						method: 'POST',
						headers:
						{
							'Content-Type': 'application/json',
							Authorization : `Bearer ${getToken()}`,
						},
						body: JSON.stringify({profileId, profileAnswer}),
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
					renderFriendsList('friends-list');
					renderFriendRequestsList();
				} else {
					alert(data.message || 'Failed to perform the action');
				}
			}
		}
	)
}
