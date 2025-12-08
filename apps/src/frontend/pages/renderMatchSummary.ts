import { Language, fMatch, fMatchHistory, fMatchForSummary, fMatchSummary, fProfile, fRank} from "../frontendTypes.js";
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

	transelate_per_id(translations_dashboards, 'rank_table_header', lang, 'RankTableHeader');
	transelate_per_id(translations_dashboards, 'rank_id', lang, 'RankID');
	transelate_per_id(translations_dashboards, 'username', lang, 'Username');
	transelate_per_id(translations_dashboards, 'wins', lang, 'WinsText');
	transelate_per_id(translations_dashboards, 'trophies', lang, 'TrophiesText');
	transelate_per_id(translations_dashboards, 'total_matches', lang, 'TotalMatchesText');
	transelate_per_id(translations_dashboards, 'win_rate', lang, 'WinRateText');


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

const rankTableCreator =
(rank_array:fRank[]) : string => {
	return rank_array.map((rank: fRank, index) => `
	<tr class="border-b border-white/10 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 transition-all duration-300 group">
	<td class="py-4 px-4 text-center">
		<div class="inline-flex items-center justify-center w-8 h-8 rounded-full ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-black' : index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-black' : index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-black' : 'bg-white/10 text-white'} font-bold text-sm">
			${index + 1}
		</div>
	</td>
	<td class="py-4 px-4 text-white font-semibold text-sm lg:text-base truncate max-w-[120px] group-hover:text-purple-300 transition-colors">${rank.username}</td>
	<td class="py-4 px-4 text-center text-green-400 font-medium text-sm lg:text-base">${rank.wins}</td>
	<td class="py-4 px-4 text-center">
		<span class="inline-flex items-center gap-1 text-yellow-400 font-medium text-sm lg:text-base">
			🏆 ${rank.trophies}
		</span>
	</td>
	<td class="py-4 px-4 text-center text-blue-300 font-medium text-sm lg:text-base">${rank.total_matches}</td>
	<td class="py-4 px-4 text-center">
		<span class="inline-flex items-center justify-center px-3 py-1 rounded-full ${rank.win_rate >= 70 ? 'bg-green-500/20 text-green-400' : rank.win_rate >= 50 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'} font-semibold text-sm">
			${rank.win_rate}%
		</span>
	</td>
	</tr>
`).join('');
};

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
		const chart_profiles = data_chart.profiles as fProfile[];
		//------console logging the data_chart.profiles
		chart_profiles.forEach(pr => console.log(`${pr.username}`));
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

		// rank table
		var rank_array: fRank[] = [];
		chart_profiles.forEach((pr, i)=> {
			var rank = {} as fRank;
			rank.rankID = 1;
			rank.username = pr.username;
			rank.wins = Number(pr.wins);
			rank.trophies = Number(pr.trophies);
			rank.total_matches = Number(pr.wins) + Number(pr.losses);
			rank.win_rate = rank.total_matches !== 0 ? Math.round(100 * (rank.wins / rank.total_matches)) : 0;
			rank_array.push(rank);
			console.log(`rank[${i}] = ${rank.username}, rank.wins : ${rank.wins}, rank.trophies : ${rank.trophies},rank.total_matches: ${rank.total_matches}`);
		});

		// win rate chart
		var total_win_rate = 0;
		wins_rate_array.forEach(v => total_win_rate += v.win_rate);
		const avg_win_rate = (total_win_rate / chart_profiles.length).toFixed(2);

		// normal match, tournament match chart
		var total_tournament_matches = 0;
		var total_normal_matches = 0;
		// // add dummy data tournament = true
		const dummyMatch: fMatchForSummary = {
			matchID: 14,
			player1_username: "philipp",
			player2_username: "LeafiPU",
			player1_score: 5,
			player2_score: 4,
			winner_username: "cat",
			is_tournament_match: true, // this marks it as a tournament match
			played_at: "2025-12-06 15:00:00"
		  };
		  const dummyMatch_two: fMatchForSummary = {
			matchID: 15,
			player1_username: "cat",
			player2_username: "philipp",
			player1_score: 5,
			player2_score: 4,
			winner_username: "cat",
			is_tournament_match: true, // this marks it as a tournament match
			played_at: "2025-12-06 15:00:00"
		  };
		  const dummyMatch_three: fMatchForSummary = {
			matchID: 16,
			player1_username: "cat",
			player2_username: "doggo",
			player1_score: 5,
			player2_score: 4,
			winner_username: "cat",
			is_tournament_match: true, // this marks it as a tournament match
			played_at: "2025-12-06 15:00:00"
		  };
		  summary.unshift(dummyMatch_three, dummyMatch_two ,dummyMatch);
		var total_matches = summary.length;
		summary.forEach(m => { m.is_tournament_match ? total_tournament_matches++ : null });
		console.log(`total_tournament_matches: ${total_tournament_matches}`);
		total_normal_matches = total_matches - total_tournament_matches;

		// individual player data for statistics
		//total game bars
		const maxBarHeight = 12 * 4;
		const filtered_total_games_chart_array = total_games_array.filter(p => p.value !== 0).map(p => {
			const barHeight = Math.round((p.value / total_matches) * maxBarHeight); // scale height
			const safeName = String(p.name).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

			return /*html*/`
				<div class="flex flex-col items-center">
					<div class="text-xs mt-1 text-white">${p.value}</div>
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
				<div class="max-w-7xl mx-auto px-4 py-6 space-y-6">
				  
				  <!-- Match Statistics Pie Chart -->
				  <div class="overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl max-w-2xl mx-auto">
					<div class="bg-gradient-to-r from-indigo-600/30 to-purple-600/30 px-6 py-4 border-b border-white/20">
						<h2 class="text-2xl font-bold text-white flex items-center gap-3">
							<svg class="w-7 h-7 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
								<path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
							</svg>
							<span>Match Statistics</span>
						</h2>
					</div>
					<div class="p-8 flex flex-col items-center justify-center space-y-6">
						<!-- Pie Chart -->
						<div class="w-48 h-48 rounded-full shadow-2xl shadow-purple-500/20"
							style="background: conic-gradient(
								#8b5cf6 0% ${Math.round((total_normal_matches / total_matches) * 100)}%, 
								#facc15 ${Math.round((total_normal_matches / total_matches) * 100)}% 100%
							);">
						</div>
						
						<!-- Legend -->
						<div class="flex flex-col gap-3 w-full max-w-xs">
							<div class="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
								<div class="flex items-center gap-3">
									<div class="w-5 h-5 bg-purple-500 rounded-full shadow-lg"></div>
									<span class="text-white font-semibold" id="NormalMatches">Normal Matches</span>
								</div>
								<span class="text-purple-300 font-bold text-lg">${total_normal_matches}</span>
							</div>
							<div class="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
								<div class="flex items-center gap-3">
									<div class="w-5 h-5 bg-yellow-400 rounded-full shadow-lg"></div>
									<span class="text-white font-semibold" id="TournamentMatches">Tournament Matches</span>
								</div>
								<span class="text-yellow-300 font-bold text-lg">${total_tournament_matches}</span>
							</div>
						</div>
					</div>
				  </div>

				  <!-- Player Statistics Charts -->
				  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<!-- Total Games Bar Chart -->
					<div class="overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl">
						<div class="bg-gradient-to-r from-teal-600/30 to-cyan-600/30 px-6 py-4 border-b border-white/20">
							<h2 class="text-xl font-bold text-white flex items-center gap-3">
								<svg class="w-6 h-6 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
									<path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
								</svg>
								<span id="TotalGamesPerPlayer">Total Games Per Player</span>
							</h2>
						</div>
						<div class="p-6 flex items-end justify-around h-64 overflow-x-auto">
							${total_games_chart_string}
						</div>
					</div>
			  
					<!-- Win Rate Bar Chart -->
					<div class="overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl">
						<div class="bg-gradient-to-r from-pink-600/30 to-rose-600/30 px-6 py-4 border-b border-white/20">
							<h2 class="text-xl font-bold text-white flex items-center gap-3">
								<svg class="w-6 h-6 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd"/>
								</svg>
								<span id="WinRates">Win Rates</span>
							</h2>
						</div>
						<div class="p-6 flex items-end justify-around h-64 overflow-x-auto">
							${win_rate_chart_string}
						</div>
					</div>
				  </div>

				  	<!-- Pop up Individual Stats Modal -->
					<div id="individual-stats-modal" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/80 backdrop-blur-sm">
						<div id="modal-content" class="relative bg-white/5 rounded p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto text-white shadow-2xl">
							<!-- Close hint -->
							<div class="absolute top-4 right-4 text-gray-400 text-xs">Click anywhere to close</div>
							
							<!-- Player name header -->
							<div class="mb-6 text-center">
								<h2 id="modal-player-name" class="text-3xl font-bold text-white"></h2>
								<p class="text-gray-400 text-sm mt-1">Individual Statistics</p>
							</div>
							
							<!-- Charts grid -->
							<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
								<!-- Total Games Chart -->
								<div class="bg-white/5 p-5 rounded">
									<h3 class="text-white font-semibold text-base mb-4">Total Games vs <span id="modal-individual-name" class="text-gray-300"></span></h3>
									<div id="modal-individual-total-games-chart" class="flex justify-around items-end h-48 pt-4"></div>
								</div>
								
								<!-- Win Rate Chart -->
								<div class="bg-white/5 p-5 rounded">
									<h3 class="text-white font-semibold text-base mb-4">Win Rate of <span id="modal-win-rate-name" class="text-gray-300"></span></h3>
									<div id="modal-win-rate-chart" class="flex justify-around items-end h-48 pt-4"></div>
								</div>
							</div>
						</div>
					</div>
			  
					<!-- Rank Table -->
					<div class="overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl">
						<div class="bg-gradient-to-r from-purple-600/30 to-pink-600/30 px-6 py-4 border-b border-white/20">
							<h2 class="text-2xl font-bold text-white flex items-center gap-3">
								<svg class="w-7 h-7 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
									<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
								</svg>
								<span id="RankTableHeader">Leaderboard Rankings</span>
							</h2>
						</div>
						<div class="overflow-x-auto">
							<table id="RankTable" class="w-full text-left border-collapse">
								<thead>
									<tr class="bg-white/10 border-b border-white/20">
										<th class="py-3 px-4 text-white font-bold text-xs lg:text-sm text-center" id="RankID">Rank</th>
										<th class="py-3 px-4 text-white font-bold text-xs lg:text-sm" id="Username">Player</th>
										<th class="py-3 px-4 text-white font-bold text-xs lg:text-sm text-center cursor-pointer select-none hover:bg-white/10 active:bg-white/20 transition-colors duration-150" id="Wins">
											<div class="flex items-center justify-center gap-1">
												<span id="WinsText">Wins</span>
												<svg id="WinsSortIcon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-4 h-4 opacity-50 transition-transform duration-150">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
												</svg>
											</div>
										</th>
										<th class="py-3 px-4 text-white font-bold text-xs lg:text-sm text-center cursor-pointer select-none hover:bg-white/10 active:bg-white/20 transition-colors duration-150" id="Trophies">
											<div class="flex items-center justify-center gap-1">
												<span id="TrophiesText">Trophies</span>
												<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-4 h-4 opacity-50 transition-transform duration-150">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
												</svg>
											</div>
										</th>
										<th class="py-3 px-4 text-white font-bold text-xs lg:text-sm text-center cursor-pointer select-none hover:bg-white/10 active:bg-white/20 transition-colors duration-150" id="TotalMatches">
											<div class="flex items-center justify-center gap-1">
												<span id="TotalMatchesText">Matches</span>
												<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-4 h-4 opacity-50 transition-transform duration-150">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
												</svg>
											</div>
										</th>
										<th class="py-3 px-4 text-white font-bold text-xs lg:text-sm text-center cursor-pointer select-none hover:bg-white/10 active:bg-white/20 transition-colors duration-150" id="WinRate">
											<div class="flex items-center justify-center gap-1">
												<span id="WinRateText">Win Rate</span>
												<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-4 h-4 opacity-50 transition-transform duration-150">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
												</svg>
											</div>
										</th>
									</tr>
								</thead>
								<tbody id="RankTableBody">
									${rankTableCreator(rank_array)}
								</tbody>
							</table>
						</div>
					</div>

				  <!-- Match History Table - Full Width -->
				  <div class="overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl">
					<div class="bg-gradient-to-r from-blue-600/30 to-purple-600/30 px-6 py-4 border-b border-white/20">
						<h2 class="text-2xl font-bold text-white flex items-center gap-3">
							<svg class="w-7 h-7 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
							</svg>
							<span id="MatchSummaryHeader">Match History</span>
						</h2>
					</div>
					<div class="overflow-x-auto">
						<table id="MatchTable" class="w-full text-left border-collapse">
						  <thead>
							<tr class="bg-white/10 border-b border-white/20">
							  <th class="py-3 px-4 text-white font-bold text-xs lg:text-sm text-center" id="MatchID">ID</th>
							  <th class="py-3 px-4 text-white font-bold text-xs lg:text-sm" id="Player1">Player 1</th>
							  <th class="py-3 px-4 text-white font-bold text-xs lg:text-sm" id="Player2">Player 2</th>
							  <th class="py-3 px-4 text-white font-bold text-xs lg:text-sm text-center" id="Player1Score">Score</th>
							  <th class="py-3 px-4 text-white font-bold text-xs lg:text-sm text-center" id="Player2Score">Score</th>
							  <th class="py-3 px-4 text-white font-bold text-xs lg:text-sm" id="Winner">Winner</th>
							  <th class="py-3 px-4 text-white font-bold text-xs lg:text-sm text-center" id="IsTournamentMatch">Type</th>
							  <th class="py-3 px-4 text-white font-bold text-xs lg:text-sm hidden lg:table-cell" id="PlayedAt">Played At</th>
							</tr>
						  </thead>
						  <tbody>
							${summary.map((match: fMatchForSummary, index) => `
							  <tr class="border-b border-white/10 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 transition-all duration-300 group">
								<td class="py-4 px-4 text-center">
									<span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 text-white font-semibold text-xs">
										${match.matchID}
									</span>
								</td>
								<td data-player="pl_${match.player1_username}" class="pl_${match.player1_username} cursor-pointer py-4 px-4 text-white font-semibold text-sm lg:text-base truncate max-w-[120px] hover:text-blue-300 transition-colors">${match.player1_username}</td>
								<td data-player="pl_${match.player2_username}" class="pl_${match.player2_username} cursor-pointer py-4 px-4 text-white font-semibold text-sm lg:text-base truncate max-w-[120px] hover:text-purple-300 transition-colors">${match.player2_username}</td>
								<td class="py-4 px-4 text-center">
									<span class="inline-flex items-center justify-center w-10 h-10 rounded-lg ${match.player1_score > match.player2_score ? 'bg-green-500/20 text-green-400 font-bold' : 'bg-red-500/20 text-red-400'} text-sm lg:text-base">
										${match.player1_score}
									</span>
								</td>
								<td class="py-4 px-4 text-center">
									<span class="inline-flex items-center justify-center w-10 h-10 rounded-lg ${match.player2_score > match.player1_score ? 'bg-green-500/20 text-green-400 font-bold' : 'bg-red-500/20 text-red-400'} text-sm lg:text-base">
										${match.player2_score}
									</span>
								</td>
								<td data-player="pl_${match.winner_username}" class="pl_${match.winner_username} cursor-pointer py-4 px-4">
									<span class="inline-flex items-center gap-1 text-yellow-400 font-semibold text-sm lg:text-base hover:text-yellow-300 transition-colors">
										👑 ${match.winner_username}
									</span>
								</td>
								<td class="py-4 px-4 text-center">
									<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${match.is_tournament_match ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}">
										${match.is_tournament_match ? '🏆 Tournament' : '🎮 Normal'}
									</span>
								</td>
								<td class="py-4 px-4 text-gray-400 text-xs hidden lg:table-cell">${new Date(match.played_at).toLocaleString()}</td>
							  </tr>
							`).join('')}
						  </tbody>
						</table>
				  </div>
			  
				</div>
			  `);
		//----adding event listener for each individual user
		const modal = document.getElementById("individual-stats-modal")!;
		const modalContent = document.getElementById("modal-content")!;
		
		// Close modal when clicking outside the content
		modal.addEventListener("click", (e) => {
			modal.classList.add("hidden");
			modal.classList.remove("flex");
		});
		
		// Prevent closing when clicking inside the modal content
		modalContent.addEventListener("click", (e) => {
			e.stopPropagation();
		});
		
		chart_profiles.forEach(pr=>
			{
				const pr_name : string = pr.username;
				const class_pr_name : string = ".pl_"+pr.username;
				const current_el : NodeListOf<Element> = document.querySelectorAll(class_pr_name);
				current_el.forEach(cl =>cl.addEventListener("click", 
					()=>
						{
							const personal_matches = summary.filter(match=> match.player1_username == pr_name || match.player2_username == pr_name );
							
							console.log(`personal_matches ${personal_matches}`);//---we need the two individual charts
							const op_array : {name:string}[]= [];
							personal_matches.forEach(match=>{
								const opponent = match.player1_username === pr_name ? match.player2_username : match.player1_username;
								op_array.push({name : opponent});
							})
							var op_array_unique: { name: string, total_matches: number, individual_wins: number, individual_win_rate: number }[] = [];
							op_array.forEach(
								op=> {!op_array_unique.some(unique=> unique.name == op.name) ? 
											op_array_unique.push({name: op.name,total_matches: 0,individual_wins: 0,individual_win_rate: 0}) : null;
										})
							console.log(`Clicked on the ${pr_name}`);
							//individual total matches
							op_array_unique.map(op => personal_matches.forEach(match => match.player1_username === op.name || match.player2_username === op.name ? op.total_matches++ : null));
							//wins
							op_array_unique.map(op => personal_matches.forEach(match => (match.player1_username === op.name || match.player2_username === op.name) && (match.winner_username === pr_name) ? op.individual_wins++: null));
							//wins rate
							op_array_unique.map(op=> op.total_matches !== 0 ? op.individual_win_rate = Math.round(op.individual_wins / op.total_matches) * 100: 0);
							
							// individual total games bars
							const maxPrBarHeight = 12 * 4;
							const pr_total_games_chrt = op_array_unique.map(op=>{
								const barHeight = Math.round((op.total_matches / personal_matches.length) * maxPrBarHeight);
								const safeName = String(op.name).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
								return /*html*/`
								<div class="flex flex-col items-center">
									<div class="text-xs mt-1 text-white">${op.total_matches}</div>
									<div class="w-10 bg-gradient-to-t from-purple-600 to-pink-400 rounded" style="height: ${barHeight}px;"></div>
									<div class="text-xs mt-1 text-white text-center">${safeName}</div>
								</div>`;});
							const pr_total_games_chrt_string : string = pr_total_games_chrt.join('');
							
							// individual total win rates
							const maxPrlWinRateBarHeight = 64;
							const pr_win_rate_chart = op_array_unique.map(opp => {
								const barHeight = Math.round((opp.individual_win_rate / 100) * maxPrlWinRateBarHeight);
								const safeName = String(opp.name).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
					
								return /*html*/`
									<div class="flex flex-col items-center">
										<div class="text-xs mt-1 text-white">${opp.individual_win_rate}%</div>
										<div class="w-10 bg-gradient-to-t from-purple-600 to-pink-400 rounded" style="height: ${barHeight}px;"></div>
										<div class="text-xs mt-1 text-white text-center">${safeName}</div>
									</div>
									`;
							});
							const pr_win_rate_chart_string = pr_win_rate_chart.join('');
							
							// Update modal content
							const modalPlayerName = document.getElementById("modal-player-name");
							const modalIndividualName = document.getElementById("modal-individual-name");
							const modalWinRateName = document.getElementById("modal-win-rate-name");
							const modalTotalGamesChart = document.getElementById("modal-individual-total-games-chart");
							const modalWinRateChart = document.getElementById("modal-win-rate-chart");
							
							if (modalPlayerName) modalPlayerName.textContent = pr_name;
							if (modalIndividualName) modalIndividualName.textContent = pr_name;
							if (modalWinRateName) modalWinRateName.textContent = pr_name;
							if (modalTotalGamesChart) modalTotalGamesChart.innerHTML = pr_total_games_chrt_string;
							if (modalWinRateChart) modalWinRateChart.innerHTML = pr_win_rate_chart_string;
							
							// Show modal
							modal.classList.remove("hidden");
							modal.classList.add("flex");
						}))
			})
		
		// Add sorting functionality to Rank Table
		const rankTableBody = document.getElementById("RankTableBody");
		const wins = document.getElementById("Wins");
		const trophies = document.getElementById("Trophies");
		const rank_total_matches = document.getElementById("TotalMatches");
		const win_rate = document.getElementById("WinRate");

		if (wins && rankTableBody) {
			wins.addEventListener("click", () => {
				rank_array.sort((a, b) => b.wins - a.wins);
				rankTableBody.innerHTML = rankTableCreator(rank_array);
			});
		}

		if (trophies && rankTableBody) {
			trophies.addEventListener("click", () => {
				rank_array.sort((a, b) => b.trophies - a.trophies);
				rankTableBody.innerHTML = rankTableCreator(rank_array);
			});
		}

		if (rank_total_matches && rankTableBody) {
			rank_total_matches.addEventListener("click", () => {
				rank_array.sort((a, b) => b.total_matches - a.total_matches);
				rankTableBody.innerHTML = rankTableCreator(rank_array);
			});
		}

		if (win_rate && rankTableBody) {
			win_rate.addEventListener("click", () => {
				rank_array.sort((a, b) => b.win_rate - a.win_rate);
				rankTableBody.innerHTML = rankTableCreator(rank_array);
			});
		}
		
		addMatchSummaryTranslations(languageStore.language);
		languageStore.subscribe((lang) => addMatchSummaryTranslations(lang));
	} catch (e: any) {
		alert(e.message);
		renderConnectionErrorPage();
	};

}