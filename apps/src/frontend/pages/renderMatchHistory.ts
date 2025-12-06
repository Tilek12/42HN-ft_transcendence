import { Language, fMatch, fMatchHistory } from "../frontendTypes.js";
import { apiFetch, getUser } from "../utils/auth.js";
import { renderConnectionErrorPage } from "./error.js";
import { languageStore, transelate_per_id, translations_profile } from "./languages.js";
import { showError } from "./renderProfiles.js";



function addMatchHistoryTranslations(lang: Language) {
	transelate_per_id(translations_profile, 'opponent', lang, 'Opponent');
	transelate_per_id(translations_profile, 'score', lang, 'Score');
	transelate_per_id(translations_profile, 'result', lang, 'Result');
	transelate_per_id(translations_profile, 'played_at', lang, 'Played_At');
	transelate_per_id(translations_profile, 'wins', lang, 'Wins');
	transelate_per_id(translations_profile, 'losses', lang, 'Losses');
	transelate_per_id(translations_profile, 'total', lang, 'Total');
	transelate_per_id(translations_profile, 'rate', lang, 'Rate');
	transelate_per_id(translations_profile, 'tournament_games', lang, 'tournament_games');
	transelate_per_id(translations_profile, "no_match_history", lang, "match_history_label");
}


export async function renderMatchHistory() {
	try {
		const matchContainer = document.getElementById('match-history') as HTMLElement;
		
		const user = getUser();


		const res = await apiFetch('/api/private/match/user', {
			method: 'GET',
			credentials: 'include',
		})
		let data;
		try{data = await res.json();}catch(e:any){data = {}}
		if (!res.ok) {
			return showError('match_history_error', res);
		}
		const history = data.history as fMatchHistory;
		if (!matchContainer || !user || history.matches.length === 0)
		{
			console.log("NO MATCH HISTORY")
			document.getElementById('no_match_history_span')?.classList.remove('hidden');
			return;
		}
		else {
			document.getElementById('no_match_history_span')?.classList.add('hidden');
			matchContainer.innerHTML =
				/*html*/
			`
			<!-- Overview Table -->
			<div class="overflow-x-auto rounded-xl">
				<table class="w-full text-left border-collapse text-sm mb-2 rounded-xl">
					<thead>
						<tr class="bg-white/20 backdrop-blur-sm">
						<th class="py-2 px-2 text-white font-semibold text-xs lg:text-sm hidden xl:table-cell" id="Wins" ></th>
						<th class="py-2 px-2 text-white font-semibold text-xs lg:text-sm hidden xl:table-cell" id="Losses" ></th>
						<th class="py-2 px-2 text-white font-semibold text-xs lg:text-sm hidden xl:table-cell" id="Total" ></th>
						<th class="py-2 px-2 text-white font-semibold text-xs lg:text-sm hidden xl:table-cell" id="Rate" ></th>
						<th class="py-2 px-2 text-white font-semibold text-xs lg:text-sm hidden xl:table-cell" id="tournament_games" ></th>

					</thead>
					<tbody>
					<tr class="border-t border-white/10 bg-white/5 hover:bg-white/20 transition-colors duration-200">
							<!-- WINS -->
							<td class="py-2 px-2 text-green-400 font-bold text-xs hidden xl:table-cell">${history.wins}</td>
							
							<!-- LOSSES -->
							<td class="py-2 px-2 text-red-400 font-bold text-xs hidden xl:table-cell">${history.total - history.wins}</td>

							<!-- TOTAL -->
							<td class="py-2 px-2 text-blue-400 font-bold text-xs hidden xl:table-cell">${history.total}</td>

							<!-- WINRATE -->
							<td class="py-2 px-2 hidden xl:table-cell">
								${`<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/30 text-purple-300">${history.win_rate}%</span>`}
							</td>
							<!-- WINRATE -->
							<td class="py-2 px-2 hidden xl:table-cell">
								${`<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/30 text-purple-300">${history.tournament_games}</span>`}
							</td>
					</tbody>
				</table>
				<!-- Match Table -->
				<table class="w-full text-left border-collapse text-sm">
					<thead>
						<tr class="bg-white/20 backdrop-blur-sm">
						<th class="py-2 px-2 text-white font-semibold text-xs lg:text-sm" id="Opponent"></th>
						<th class="py-2 px-2 text-white font-semibold text-xs lg:text-sm" id="Score"></th>
						<th class="py-2 px-2 text-white font-semibold text-xs lg:text-sm" id="Result"></th>
						<th class="py-2 px-2 text-white font-semibold text-xs lg:text-sm hidden lg:table-cell" id="Played_At" ></th>
						</tr>
					</thead>
					<tbody>
						${history.matches.map((match: fMatch, index) => /*html*/`

						<tr class="border-t border-white/10 ${index % 2 === 0 ? 'bg-white/5' : 'bg-white/10'} hover:bg-white/20 transition-colors duration-200">

							<!-- OPPONENT -->
							<td class="py-2 px-2 text-white font-medium text-xs lg:text-sm truncate max-w-[80px]">${match.player1_id === user.id ? match.player2_username : match.player1_username}</td>
							
							<!-- SCORE -->
							<td class="py-2 px-2 text-white font-mono text-xs lg:text-sm whitespace-nowrap">
								${match.player1_id === user.id ?
										`<span class="font-bold text-blue-400">${match.player1_score}</span>-<span class="text-gray-300">${match.player2_score}</span>`
									: 	`<span class="font-bold text-blue-400">${match.player2_score}</span>-<span class="text-gray-300">${match.player1_score}</span>`}
							</td>

							<!-- RESULT -->
							<td class="py-2 px-2">
								<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${match.winner_id === null ? 'bg-gray-500/30 text-gray-200' : match.winner_id === user.id 	? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'}">
									${match.winner_id === null ? 'Tie' : match.winner_id === user.id ? 'Win' : 'Loss'}
								</span>
							</td>

							<!-- DATE -->
							<td class="py-2 px-2 text-gray-300 text-xs hidden lg:table-cell">${new Date(match.played_at).toLocaleString()}</td>					
						</tr>
						`).join('')}
					</tbody>
				</table>
			</div>
			`;
		}
		addMatchHistoryTranslations(languageStore.language);
		languageStore.subscribe((lang) => addMatchHistoryTranslations(lang));

	} catch (e: any) {
		renderConnectionErrorPage();
	};

}