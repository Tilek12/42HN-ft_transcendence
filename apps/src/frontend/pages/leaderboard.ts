
import { renderBackgroundFull } from '../utils/layout.js'
import {languageStore, translations_leaderboards, transelate_per_id} from './languages.js';


export async function renderLeaderboard(root: HTMLElement) {
	const tr =	translations_leaderboards[languageStore.language];

	try {
	const tournamentId = 1;
	const res = await fetch(`/api/tournament/${tournamentId}/leaderboard`);

	if (!res.ok) {
		throw new Error(`Server error: ${res.status}`);
	}

	const leaderboard = await res.json();


	root.innerHTML =renderBackgroundFull(
		/*html*/
		`<div class="pt-24 max-w-xl mx-auto text-white text-center mb-6">
		<h1 id="leaderboard_ld_header"class="text-3xl font-semibold">${tr!.leaderboard_ld_header}</h1>
		<p id="top_player_ld_header"class="text-gray-400">${tr!.top_player_ld_header}</p>
		</div>

		<div class="overflow-x-auto">
		<table class="mx-auto w-full max-w-4xl border text-left text-black shadow rounded-lg overflow-hidden">
			<thead class="bg-gray-100">
			<tr>
				<th class="py-2 px-4">#</th>
				<th id="username_ld_header"class="py-2 px-4">${tr!.username_ld_header}</th>
				<th id="wins_ld_header"class="py-2 px-4">${tr!.wins_ld_header}</th>
				<th id="losses_ld_header"class="py-2 px-4">${tr!.losses_ld_header}</th>
				<th id="trophies_ld_header"class="py-2 px-4">${tr!.trophies_ld_header}</th>
				<th id="matches_played_ld_header"class="py-2 px-4">${tr!.matches_played_ld_header}</th>
				<th id="wins_in_tour_ld_header"class="py-2 px-4">${tr!.wins_in_tour_ld_header}</th>
			</tr>
			</thead>
			<tbody>
			${leaderboard.map((user: any, index: number) => `
				<tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
				<td class="py-2 px-4">${index + 1}</td>
				<td class="py-2 px-4 font-medium">${user.username}</td>
				<td class="py-2 px-4">${user.wins}</td>
				<td class="py-2 px-4">${user.losses}</td>
				<td class="py-2 px-4">${user.trophies}</td>
				<td class="py-2 px-4">${user.matches_played}</td>
				<td class="py-2 px-4">${user.wins_in_tournament}</td>
				</tr>
			`).join('')}
			</tbody>
		</table>
		</div>
	`);
	languageStore.subscribe((lang)=>{
		transelate_per_id(translations_leaderboards, "leaderboard_ld_header", lang, "leaderboard_ld_header");
		transelate_per_id(translations_leaderboards, "top_player_ld_header", lang, "top_player_ld_header");
		transelate_per_id(translations_leaderboards, "username_ld_header", lang, "username_ld_header");
		transelate_per_id(translations_leaderboards, "wins_ld_header", lang, "wins_ld_header");
		transelate_per_id(translations_leaderboards, "losses_ld_header", lang, "losses_ld_header");
		transelate_per_id(translations_leaderboards, "trophies_ld_header", lang, "trophies_ld_header");
		transelate_per_id(translations_leaderboards, "matches_played_ld_header", lang, "matches_played_ld_header");
		transelate_per_id(translations_leaderboards, "wins_in_tour_ld_header", lang, "wins_in_tour_ld_header");
		transelate_per_id(translations_leaderboards, "failed_ld_header", lang, "failed_ld_header");
	});
	} catch (err: any) {
	root.innerHTML = renderBackgroundFull(
		/*html*/
	`<div class="pt-24 text-center text-red-500">
		<p><span id="failed_ld_header">${tr!.failed_ld_header}</span>: ${err.message}</p>
		</div>
	`);
	}
}
