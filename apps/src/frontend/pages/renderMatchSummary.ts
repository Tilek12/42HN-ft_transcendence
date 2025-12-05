import { Language, fMatch, fMatchHistory, fMatchForSummary, fMatchSummary,  } from "../types.js";
import { apiFetch, getUser } from "../utils/auth.js";
import { renderConnectionErrorPage } from "./error.js";
import { languageStore, transelate_per_id, translations_dashboards } from "./languages.js";



function addMatchSummaryTranslations(lang: Language) {
	transelate_per_id(translations_dashboards, 'match_summary_header', lang, 'MatchSummaryHeader');
	// transelate_per_id(translations_profile, 'score', lang, 'Score');
	// transelate_per_id(translations_profile, 'result', lang, 'Result');
	// transelate_per_id(translations_profile, 'played_at', lang, 'Played_At');
	// transelate_per_id(translations_profile, 'wins', lang, 'Wins');
	// transelate_per_id(translations_profile, 'losses', lang, 'Losses');
	// transelate_per_id(translations_profile, 'total', lang, 'Total');
	// transelate_per_id(translations_profile, 'rate', lang, 'Rate');
	// transelate_per_id(translations_profile, 'tournament_games', lang, 'tournament_games');
	// transelate_per_id(translations_profile, "no_match_history", lang, "match_history_label");
}


export async function renderMatchSummary(root:HTMLElement) {
	try {
		// const matchContainer = document.getElementById('match-summary') as HTMLElement;//frontend div id
		
		const res = await apiFetch('/api/private/match/summary', {
			method: 'GET',
			credentials: 'include',
		})
		const data = await res.json();
		if (!res.ok) {
			alert(data.message)
		}
		const trysummary = data.summary 
		if (!trysummary){
			alert(`no summary`)
			return;
		}
		else {
			const summary = trysummary as fMatchForSummary[];
			root.innerHTML =
				/*html*/
			`
				<!-- Match Table -->
				<div class="overflow-y-auto overflow-x-hidden pr-1">
					<span id="MatchSummaryHeader"></span>
					<table class="w-full text-left border-collapse text-sm">
						<thead>
							<tr class="bg-white/20 backdrop-blur-sm">
							<th class="py-2 px-2 text-white font-semibold text-xs lg:text-sm" id="MatchID"></th>
							<th class="py-2 px-2 text-white font-semibold text-xs lg:text-sm" id="Player1"></th>
							<th class="py-2 px-2 text-white font-semibold text-xs lg:text-sm" id="Player2"></th>
							<th class="py-2 px-2 text-white font-semibold text-xs lg:text-sm" id="Player1Score"></th>
							<th class="py-2 px-2 text-white font-semibold text-xs lg:text-sm" id="Player2Score"></th>
							<th class="py-2 px-2 text-white font-semibold text-xs lg:text-sm" id="Winner"></th>
							<th class="py-2 px-2 text-white font-semibold text-xs lg:text-sm" id="IsTournamentMatch"></th>
							<th class="py-2 px-2 text-white font-semibold text-xs lg:text-sm hidden lg:table-cell" id="PlayedAt" ></th>
							</tr>
						</thead>
						<tbody>
						${summary.map((match: fMatchForSummary, index) => `
						  <tr class="border-t border-white/10 ${index % 2 === 0 ? 'bg-white/5' : 'bg-white/10'} hover:bg-white/20 transition-colors duration-200">
							<td class="py-2 px-2 text-white font-medium text-xs lg:text-sm truncate max-w-[80px]">${match.matchID}</td>
							<td class="py-2 px-2 text-white font-medium text-xs lg:text-sm truncate max-w-[80px]">${match.player1_username}</td>
							<td class="py-2 px-2 text-white font-medium text-xs lg:text-sm truncate max-w-[80px]">${match.player2_username}</td>
							<td class="py-2 px-2 text-white font-medium text-xs lg:text-sm">${match.player1_score}</td>
							<td class="py-2 px-2 text-white font-medium text-xs lg:text-sm">${match.player2_score}</td>
							<td class="py-2 px-2 text-white font-medium text-xs lg:text-sm">${match.winner_username}</td>
							<td class="py-2 px-2 text-white font-medium text-xs lg:text-sm">${match.is_tournament_match ? 'Yes' : 'No'}</td>
							<td class="py-2 px-2 text-gray-300 text-xs hidden lg:table-cell">${new Date(match.played_at).toLocaleString()}</td>
						  </tr>
						`).join('')}
					  </tbody>
					</table>
				</div>
			`;
		}
		addMatchSummaryTranslations(languageStore.language);
		languageStore.subscribe((lang) => addMatchSummaryTranslations(lang));
	} catch (e: any) {
		alert(e.message);
		renderConnectionErrorPage();
	};

}