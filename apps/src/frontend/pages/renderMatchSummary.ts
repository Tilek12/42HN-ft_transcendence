import { Language, fMatch, fMatchHistory, fMatchForSummary, fMatchSummary,  } from "../types.js";
import { apiFetch, getUser } from "../utils/auth.js";
import { renderBackgroundFull } from "../utils/layout.js";
import { renderConnectionErrorPage } from "./error.js";
import { languageStore, transelate_per_id, translations_dashboards } from "./languages.js";



function addMatchSummaryTranslations(lang: Language) {
	transelate_per_id(translations_dashboards, 'match_summary_header', lang, 'MatchSummaryHeader');
	transelate_per_id(translations_dashboards, 'match_id', lang, 'MatchID');
	transelate_per_id(translations_dashboards, 'player1_username', lang, 'Player1');
	transelate_per_id(translations_dashboards, 'player2_username', lang, 'Player2');
	transelate_per_id(translations_dashboards, 'player1_score', lang, 'Player1Score');
	transelate_per_id(translations_dashboards, 'player2_score', lang, 'Player2Score');
	transelate_per_id(translations_dashboards, 'winner_username', lang, 'Winner');
	transelate_per_id(translations_dashboards, 'is_tournament_match', lang, 'IsTournamentMatch');
	transelate_per_id(translations_dashboards, 'played_at', lang, 'PlayedAt');
}


export async function renderMatchSummary(root:HTMLElement) {
	try {
		
		// Match summary
		const res = await apiFetch('/api/private/match/summary', {
			method: 'GET',
			credentials: 'include',
		})
		const data = await res.json();
		if (!res.ok) {
			alert(data.message)
		}
		const trysummary = data.summary
		if (!trysummary)
		{
			alert(`no summary`)
			return;
		}

		// total-games-charts
		const res_chart = await apiFetch('/api/private/parse-profiles-for-total-games-charts', {
			method: 'GET',
			credentials: 'include'
		});
		const data_chart = await res_chart.json();
		if (!res_chart.ok) {
			alert(data_chart.message)
		}
		console.log(`data: ${data_chart.profiles}`);
		const total_games_array: { name: string; value: number }[] = [];
		const chart_profiles = data_chart.profiles;
		if (!chart_profiles)
		{		
			alert(`no chart_profiles`)
			return;
		}
		chart_profiles.forEach((row: any, i: number) => 
		{
			const total_games = Number(row.wins) + Number(row.losses);
			total_games_array.push({name: row.username, value: total_games});
			console.log(`total_games_arra[${i}] = ${row.username}, ${total_games}`);
		})
			const summary = trysummary as fMatchForSummary[];
			console.log(`the summary[0]: ${summary[0].matchID}`);
			var total_matches = summary[0].matchID;
			// console.log(`total_matches: ${total_matches}`);

			// we need a function that is taking the players
			// summary.filter(match:);
			// const userlist = document.getElementById('user_list');
			// console.log(`userlist:---------------`);
			// console.log(`userlist: ${userlist.}`);
			// we need a way to go for every summary [array] and ctch the name of the player
			// per player how many games

			// const total_game_chart
			root.innerHTML = renderBackgroundFull(
				/*html*/
			`
			
			   <!-- Total Games Chart -->
			   	<div class="w-full flex justify-center my-6 border">
			   		<canvas id="totalGamesChart" width="400" height="200"></canvas>
		   		</div>	
				<!-- Match Table -->
				<div class="overflow-y-auto overflow-x-hidden pr-1 border">
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
			`);
		
		addMatchSummaryTranslations(languageStore.language);
		languageStore.subscribe((lang) => addMatchSummaryTranslations(lang));
	} catch (e: any) {
		alert(e.message);
		renderConnectionErrorPage();
	};

}