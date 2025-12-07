import { Language, fMatch, fMatchHistory, fMatchForSummary, fMatchSummary, } from "../frontendTypes.js";
import { apiFetch, getUser } from "../utils/auth.js";
import { renderBackgroundFull } from "../utils/layout.js";
import { renderConnectionErrorPage } from "./error.js";
import { languageStore, transelate_per_id, translations_dashboards } from "./languages.js";



function addMatchSummaryTranslations(lang: Language) {
	transelate_per_id(translations_dashboards, 'normal_matches', lang, 'NormalMatches');
	transelate_per_id(translations_dashboards, 'tournament_matches', lang, 'TournamentMatches');
	transelate_per_id(translations_dashboards, 'total_games_per_player', lang, 'TotalGamesPerPlayer');
	transelate_per_id(translations_dashboards, 'win_rates', lang, 'WinRates');
	transelate_per_id(translations_dashboards, 'total_games_of_individual', lang, 'TotalGamesOf');
	transelate_per_id(translations_dashboards, 'individual_win_rate_of', lang, 'IndividualWinRateOf');
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


export async function renderMatchSummary(root: HTMLElement) {
	try {

		// Match summary data
		const res = await apiFetch('/api/private/match/summary', {
			method: 'GET',
			credentials: 'include',
		})
		const data = await res.json();
		if (!res.ok) {
			alert(data.message)
		}
		if (!data.summary) {
			alert(`no summary`)
			return;
		}
		const summary = data.summary as fMatchForSummary[];


		// total-games-chart and win rate chart data
		const res_chart = await apiFetch('/api/private/parse-profiles-for-total-games-charts', {
			method: 'GET',
			credentials: 'include'
		});
		const data_chart = await res_chart.json();
		if (!res_chart.ok) {
			alert(data_chart.message)
		}
		// total-games-chart
		console.log(`data: ${data_chart.profiles}`);
		const total_games_array: { name: string; value: number }[] = [];
		const chart_profiles = data_chart.profiles;
		const wins_rate_array: { name: string; win_rate: number }[] = [];
		if (!chart_profiles) {
			alert(`no chart_profiles`)
			return;
		}
		chart_profiles.forEach((row: any, i: number) => {
			const total_games = Number(row.wins) + Number(row.losses);
			total_games_array.push({ name: row.username, value: total_games });
			const wins_rate_var = (Number(row.wins) == 0) ? 0 : Math.round((Number(row.wins) / total_games) * 100);
			wins_rate_array.push({ name: row.username, win_rate: wins_rate_var });

			console.log(`win rate: ${wins_rate_var}`);
		})
		// win rate chart
		var total_win_rate = 0;
		wins_rate_array.forEach(v => total_win_rate += v.win_rate);
		const avg_win_rate = (total_win_rate / chart_profiles.length).toFixed(2);
		// console.log(`avg_win_rate: ${avg_win_rate}`);
		// console.log(`chart_profiles.length: ${chart_profiles.length}`);
		// console.log(total_games_array[0].name);
		// console.log(total_games_array[0].value);
		// console.log(`the summary[0]: ${summary[0].matchID}`);
		// normal match, tournament match chart
		var total_tournament_matches = 0;
		var total_normal_matches = 0;
		// // add dummy data tournament = true
		// const dummyMatch: fMatchForSummary = {
		// 	matchID: 14,
		// 	player1_username: "cat",
		// 	player2_username: "philipp",
		// 	player1_score: 5,
		// 	player2_score: 4,
		// 	winner_username: "cat",
		// 	is_tournament_match: true, // this marks it as a tournament match
		// 	played_at: "2025-12-06 15:00:00"
		//   };
		//   const dummyMatch_two: fMatchForSummary = {
		// 	matchID: 15,
		// 	player1_username: "cat",
		// 	player2_username: "philipp",
		// 	player1_score: 5,
		// 	player2_score: 4,
		// 	winner_username: "cat",
		// 	is_tournament_match: true, // this marks it as a tournament match
		// 	played_at: "2025-12-06 15:00:00"
		//   };
		//   const dummyMatch_three: fMatchForSummary = {
		// 	matchID: 16,
		// 	player1_username: "cat",
		// 	player2_username: "philipp",
		// 	player1_score: 5,
		// 	player2_score: 4,
		// 	winner_username: "cat",
		// 	is_tournament_match: true, // this marks it as a tournament match
		// 	played_at: "2025-12-06 15:00:00"
		//   };
		//   summary.unshift(dummyMatch_three,  dummyMatch_two,dummyMatch);
		var total_matches = summary.length;
		summary.forEach(m => { m.is_tournament_match ? total_tournament_matches++ : null });
		console.log(`total_tournament_matches: ${total_tournament_matches}`);
		total_normal_matches = total_matches - total_tournament_matches;

		// individual player data for statistics
		const individual_summary_matches = summary.filter(match => match.player1_username == "cat" || match.player2_username == "cat");
		console.log(`individual_summary_matches: ${individual_summary_matches}`);
		const opponents_array: { name: string }[] = [];
		individual_summary_matches.forEach(match => {
			const opponent =
				match.player1_username === "cat"
					? match.player2_username
					: match.player1_username;
			opponents_array.push({ name: opponent });
		});
		var opponents_array_unique: { name: string, total_matches: number, individual_wins: number, individual_win_rate: number }[] = [];

		opponents_array.forEach(o => {
			if (!opponents_array_unique.some(u => u.name === o.name)) {
				opponents_array_unique.push({ name: o.name, total_matches: 0, individual_wins: 0, individual_win_rate: 0 });
			}
		});
		opponents_array_unique.forEach(opp => individual_summary_matches.forEach(match => match.player1_username === opp.name || match.player2_username === opp.name ? opp.total_matches++ : null));
		opponents_array_unique.forEach(opp => individual_summary_matches.forEach(match => (match.player1_username === opp.name || match.player2_username === opp.name) && match.winner_username == "cat" ? opp.individual_wins++ : null));
		opponents_array_unique.map(opp => opp.total_matches !== 0 ? opp.individual_win_rate = Math.round((opp.individual_wins / opp.total_matches) * 100) : null);
		// console.log(`opponents_array: ${opponents_array}`);
		// console.log(`opponents_array_unique[0].total_matches: ${opponents_array_unique[0].total_matches}`);
		// console.log(`opponents_array_unique[0].individual_wins: ${opponents_array_unique[0].individual_wins}`);
		// console.log(`opponents_array_unique[0].individual_win_rate: ${opponents_array_unique[0].individual_win_rate}`);


		//individual win rate bars
		const maxIndividualWinRateBarHeight = 6;
		const individual_win_rate_chart = opponents_array_unique.map(opp => {
			const barHeight = Math.round(opp.individual_win_rate / opp.total_matches) * maxIndividualWinRateBarHeight; // scale height
			const safeName = String(opp.name).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

			return /*html*/`
				<div class="flex flex-col items-center">
					<div class="text-xs mt-1 text-white">${opp.individual_win_rate}%</div>
					<div class="w-10 bg-gradient-to-t from-purple-600 to-pink-400 rounded" style="height: ${barHeight}px;"></div>
					<div class="text-xs mt-1 text-white text-center">${safeName}</div>
				</div>
				`;
		});
		const individual_win_rate_chart_string = individual_win_rate_chart.join('');

		//individual total games bars
		const maxIndividualBarHeight = 12 * 4;
		const individual_total_games_chart = opponents_array_unique.map(opp => {
			const barHeight = Math.round((opp.total_matches / individual_summary_matches.length) * maxIndividualBarHeight); // scale height
			const safeName = String(opp.name).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

			return /*html*/`
				<div class="flex flex-col items-center">
					<div class="text-xs mt-1 text-white">${opp.total_matches}</div>
					<div class="w-10 bg-gradient-to-t from-purple-600 to-pink-400 rounded" style="height: ${barHeight}px;"></div>
					<div class="text-xs mt-1 text-white text-center">${safeName}</div>
				</div>
				`;
		});
		const individual_total_games_chart_string = individual_total_games_chart.join('');

		//total game bars
		const maxBarHeight = 12 * 4;
		const filtered_total_games_chart_array = total_games_array.filter(p => p.value !== 0).map(p => {
			const barHeight = Math.round((p.value / total_matches) * maxBarHeight); // scale height
			const safeName = String(p.name).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

			return /*html*/`
				<div class="flex flex-col items-center">
					<div class="text-xs mt-1 text-white">${p.value}</div>
					<!--div class="w-10 h-[${barHeight}px] bg-gradient-to-t from-purple-600 to-pink-400 rounded"></div-->
					<div class="w-10 bg-gradient-to-t from-purple-600 to-pink-400 rounded" style="height: ${barHeight}px;"></div>
					<div class="text-xs mt-1 text-white text-center">${safeName}</div>
				</div>
				`;
		});
		const filtered_total_games_chart_length = filtered_total_games_chart_array.length;
		const total_games_chart_string = filtered_total_games_chart_array.join('');

		// win rate bars
		const maxWinRateBarHeight = 24 * 4;
		const win_rate_chart_string = wins_rate_array.filter(p => p.win_rate !== 0).map(p => {
			const barHeight = Math.round((p.win_rate / total_win_rate) * maxWinRateBarHeight); // scale height
			const safeName = String(p.name).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

			return /*html*/`
				<div class="flex flex-col items-center">
					<div class="text-xs mt-1 text-white">${p.win_rate}%</div>
					<div class="w-10 bg-gradient-to-t from-purple-600 to-pink-400 rounded" style="height: ${barHeight}px;"></div>
					<div class="text-xs mt-1 text-white text-center">${safeName}</div>
				</div>
				`;
		}).join('');

		root.innerHTML = renderBackgroundFull(/*html*/ `


				
				<div class="flex flex-col items-center space-y-8">
				  
				  <!-- Charts Row -->
				  <div class="grid grid-cols-3 gap-6 w-full justify-items-center">
					
					<!-- Pie Chart -->
					<div class="flex flex-col items-center space-y-4">
					<div
						class="w-40 h-40 rounded-full"
						style="
						background: conic-gradient(
							#8b5cf6 0% ${Math.round((total_normal_matches / total_matches) * 100)}%, 
							#facc15 ${Math.round((total_normal_matches / total_matches) * 100)}% 100%
						);
						"
					></div>

					<div class="flex space-x-4">
						<div class="flex items-center space-x-2">
						<div class="w-4 h-4 bg-purple-500 rounded-full"></div>
						<span id="NormalMatches">Normal Matches: </span>
						<span>${total_normal_matches}</span>
						</div>
						<div class="flex items-center space-x-2">
						<div class="w-4 h-4 bg-yellow-400 rounded-full"></div>
						<span id="TournamentMatches">Tournament Matches: </span>
						<span>${total_tournament_matches}</span>
						</div>
					</div>
					</div>

			  
					<!-- Total Games Bar Chart -->
					<div class="relative w-[420px] h-[340px] bg-white/5 rounded text-white">
					  <div class="text-center text-lg font-semibold pt-4" id="TotalGamesPerPlayer">
						Total Games Per Player
					  </div>
					  <div class="flex items-end space-x-4 overflow-x-auto mt-[180px]">
						${total_games_chart_string}
					  </div>
					</div>
			  
					<!-- Win Rate Bar Chart -->
					<div class="relative w-[420px] h-[340px] bg-white/5 rounded text-white">
					  <div class="text-center text-lg font-semibold pt-4" id="WinRates">
						Win Rates
					  </div>
					  <div class="flex items-end space-x-4 overflow-x-auto mt-[180px]">
						${win_rate_chart_string}
					  </div>
					</div>
			  
				  </div>

				  	<!-- Total Games for individual Bar Chart -->
					<div class="relative w-[420px] h-[340px] bg-white/5 rounded text-white">
					<div class="text-center text-lg font-semibold pt-4" id="TotalGamesPerPlayer">
					  <span id="TotalGamesOf">Total games of</span> cat
					</div>
					<div class="flex items-end space-x-4 overflow-x-auto mt-[180px]">
					  ${individual_total_games_chart}
					</div>
				  </div>

				  	<!-- individual win rate Bar Chart -->
					<div class="relative w-[420px] h-[340px] bg-white/5 rounded text-white">
					<div class="text-center text-lg font-semibold pt-4" id="TotalGamesPerPlayer">
					<span id="IndividualWinRateOf">Individual Win Rate of</span> cat
					</div>
					<div class="flex items-end space-x-4 overflow-x-auto mt-[180px]">
					  ${individual_win_rate_chart}
					</div>
				  </div>
			  
				  <!-- Match Table -->
				  <div class="overflow-y-auto overflow-x-hidden pr-1 w-full">
					<span id="MatchSummaryHeader"></span>
					<table id="MatchTable" class="w-full text-left border-collapse text-sm">
					  <thead>
						<tr class="bg-white/20 backdrop-blur-sm">
						  <th class="py-2 px-2 text-white font-semibold text-xs lg:text-sm" id="MatchID"></th>
						  <th class="py-2 px-2 text-white font-semibold text-xs lg:text-sm" id="Player1"></th>
						  <th class="py-2 px-2 text-white font-semibold text-xs lg:text-sm" id="Player2"></th>
						  <th class="py-2 px-2 text-white font-semibold text-xs lg:text-sm" id="Player1Score"></th>
						  <th class="py-2 px-2 text-white font-semibold text-xs lg:text-sm" id="Player2Score"></th>
						  <th class="py-2 px-2 text-white font-semibold text-xs lg:text-sm" id="Winner"></th>
						  <th class="py-2 px-2 text-white font-semibold text-xs lg:text-sm" id="IsTournamentMatch"></th>
						  <th class="py-2 px-2 text-gray-300 text-xs hidden lg:table-cell" id="PlayedAt"></th>
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
			  
				</div>

				
			  `);



		addMatchSummaryTranslations(languageStore.language);
		languageStore.subscribe((lang) => addMatchSummaryTranslations(lang));
	} catch (e: any) {
		alert(e.message);
		renderConnectionErrorPage();
	};

}