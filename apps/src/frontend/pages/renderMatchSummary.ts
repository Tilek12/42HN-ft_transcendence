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
		const wins_rate_array : { name: string; win_rate: number }[] = [];
		if (!chart_profiles)
		{		
			alert(`no chart_profiles`)
			return;
		}
		chart_profiles.forEach((row: any, i: number) => 
		{
			const total_games = Number(row.wins) + Number(row.losses);
			total_games_array.push({name: row.username, value: total_games});
			const wins_rate_var = (Number(row.wins) == 0) ? 0 : Math.round((Number(row.wins)/total_games)*100);
			wins_rate_array.push({name: row.username, win_rate: wins_rate_var});
			console.log(`win rate: ${wins_rate_var}`);
		})
			var total_win_rate = 0;
			wins_rate_array.forEach(v=> total_win_rate += v.win_rate);
			const avg_win_rate = (total_win_rate / chart_profiles.length).toFixed(2);
			console.log(`avg_win_rate: ${avg_win_rate}`);
			console.log(`chart_profiles.length: ${chart_profiles.length}`);
			console.log(total_games_array[0].name);
			console.log(total_games_array[0].value);
			const summary = trysummary as fMatchForSummary[];
			console.log(`the summary[0]: ${summary[0].matchID}`);
			var total_matches = summary[0].matchID;

		

			const maxBarHeight = 12 * 4;
			const filtered_total_games_chart_array = total_games_array.filter(p=> p.value !== 0).map(p => {
				const barHeight = Math.round((p.value / total_matches) * maxBarHeight); // scale height
				const safeName = String(p.name).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
		
				return /*html*/`
				<div class="flex flex-col items-center">
					<div class="text-xs mt-1 text-white">${p.value}</div>
					<div class="w-10 h-[${barHeight}px] bg-gradient-to-t from-purple-600 to-pink-400 rounded"></div>
					<div class="text-xs mt-1 text-white text-center">${safeName}</div>
				</div>
				`;
			});
			const filtered_total_games_chart_length = filtered_total_games_chart_array.length;
			const total_games_chart_string = filtered_total_games_chart_array.join('');

			const maxWinRateBarHeight = 24 * 4;
			const win_rate_chart_string = wins_rate_array.filter(p=> p.win_rate !== 0).map(p => {
				const barHeight = Math.round((p.win_rate / total_win_rate) * maxWinRateBarHeight); // scale height
				const safeName = String(p.name).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
		
				return /*html*/`
				<div class="flex flex-col items-center">
					<div class="text-xs mt-1 text-white">${p.win_rate}%</div>
					<div class="w-10 h-[${barHeight}px] bg-gradient-to-t from-purple-600 to-pink-400 rounded"></div>
					<div class="text-xs mt-1 text-white text-center">${safeName}</div>
				</div>
				`;
			}).join('');

			// const total_game_chart
			root.innerHTML = renderBackgroundFull(
				/*html*/
			`
			   <!-- Total Games Chart -->
			   <div class="relative w-[420px] h-[340px] mx-auto my-8 bg-white/5 rounded text-white">

					<!-- Graph Title -->
					<div class="text-center text-lg font-semibold pt-4">
						Total Games Per Player
					</div>
			
					<!-- Bars container -->
					<div class="flex items-end space-x-4 overflow-x-auto mt-[180px]">
						${total_games_chart_string} 
					</div>
		   		</div>
				
				<!-- Win_rate Chart -->
				<div class="relative w-[420px] h-[340px] mx-auto my-8 bg-white/5 rounded text-white">
					
				<!-- Graph Title -->
					<div class="text-center text-lg font-semibold pt-4">
						Win Rates
					</div>
			
					<!-- Bars container -->
					<div class="flex items-end space-x-4 overflow-x-auto mt-[180px]">
						${win_rate_chart_string} 
					</div>
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
			` ) ;
		
		addMatchSummaryTranslations(languageStore.language);
		languageStore.subscribe((lang) => addMatchSummaryTranslations(lang));
	} catch (e: any) {
		alert(e.message);
		renderConnectionErrorPage();
	};

}