import { Language, fMatch, fMatchHistory, fMatchForSummary, fMatchSummary, fProfile, fRank} from "../frontendTypes.js";
import { apiFetch, getUser } from "../utils/auth.js";
import { initGlobalLanguageSelector } from "../utils/globalLanguageSelector.js";
import { renderBackgroundFull } from "../utils/layout.js";
import { renderConnectionErrorPage } from "./error.js";
import { languageStore, transelate_per_id } from "./languages.js";
import { translations_dashboards } from "./languages_i18n.js";



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
	<tr class="border-t border-white/10 ${index % 2 === 0 ? 'bg-white/5' : 'bg-white/10'} hover:bg-white/20 transition-colors duration-200">
	<td class="py-2 px-2 text-white font-medium text-xs lg:text-sm">${index + 1}</td>
	<td class="py-2 px-2 text-white font-medium text-xs lg:text-sm truncate max-w-[80px]">${rank.username}</td>
	<td class="py-2 px-2 text-white font-medium text-xs lg:text-sm">${rank.wins}</td>
	<td class="py-2 px-2 text-white font-medium text-xs lg:text-sm">${rank.trophies}</td>
	<td class="py-2 px-2 text-white font-medium text-xs lg:text-sm">${rank.total_matches}</td>
	<td class="py-2 px-2 text-white font-medium text-xs lg:text-sm">${rank.win_rate}</td>
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
					  <div class="absolute bottom-4 left-0 right-0 flex items-end space-x-4 overflow-x-auto px-4 pb-2">
						${total_games_chart_string}
					  </div>
					</div>
			  
					<!-- Win Rate Bar Chart -->
					<div class="relative w-[420px] h-[340px] bg-white/5 rounded text-white">
					  <div class="text-center text-lg font-semibold pt-4" id="WinRates">
						Win Rates
					  </div>
					  <div class="absolute bottom-4 left-0 right-0 flex items-end space-x-4 overflow-x-auto px-4 pb-2">
						${win_rate_chart_string}
					  </div>
					</div>
			  
				  </div>

				  	<!-- Total Games for individual Bar Chart -->
					<div class="relative w-[420px] h-[340px] bg-white/5 rounded text-white">
					<div class="text-center text-lg font-semibold pt-4" id="TotalGamesPerPlayer">
					  <span id="TotalGamesOf">Total games of</span> <span id="IndividualName"></span>
					</div>
					<div class="absolute bottom-4 left-0 right-0 flex items-end space-x-4 overflow-x-auto px-4 pb-2" id="IndividualTotalGamesChart">
					</div>
				  </div>
				

				  	<!-- individual win rate Bar Chart -->
					<div class="relative w-[420px] h-[340px] bg-white/5 rounded text-white">
					<div class="text-center text-lg font-semibold pt-4" id="TotalGamesPerPlayer">
					<span id="IndividualWinRateOf">Individual Win Rate of</span> <span id="WinRateName"></span>
					</div>
					<div class="absolute bottom-4 left-0 right-0 flex items-end space-x-4 overflow-x-auto px-4 pb-2" id="WinRateChart">
					</div>
				  </div>
			  
					<!-- Rank Table -->
					<div class="overflow-y-auto overflow-x-hidden pr-1 w-full">
					<span id="RankTableHeader"></span>
					<table id="RankTable" class="w-full text-left border-collapse text-sm">
						<thead>
						<tr class="bg-white/20 backdrop-blur-sm">
							<th class="py-2 px-2 text-white font-semibold text-xs lg:text-sm" id="RankID"></th>
							<th class="py-2 px-2 text-white font-semibold text-xs lg:text-sm" id="Username"></th>
							<th class="py-2 px-2 text-white font-semibold text-xs lg:text-sm cursor-pointer select-none hover:bg-white/10 active:bg-white/20
           						transition-colors duration-150" id="Wins" >
								<span id="WinsText"></span><svg id="WinsSortIcon" xmlns="http://www.w3.org/2000/svg"
										fill="none" viewBox="0 0 24 24" stroke="currentColor"
										class="w-4 h-4 opacity-50 transition-transform duration-150">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
										d="M19 9l-7 7-7-7" />
									</svg></th>
							<th class="py-2 px-2 text-white font-semibold text-xs lg:text-sm cursor-pointer select-none hover:bg-white/10 active:bg-white/20
          						transition-colors duration-150" id="Trophies">
								<span id="TrophiesText"></span><svg id="WinsSortIcon" xmlns="http://www.w3.org/2000/svg"
										fill="none" viewBox="0 0 24 24" stroke="currentColor"
										class="w-4 h-4 opacity-50 transition-transform duration-150">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
										d="M19 9l-7 7-7-7" />
									</svg></th>
							<th class="py-2 px-2 text-white font-semibold text-xs lg:text-sm cursor-pointer select-none hover:bg-white/10 active:bg-white/20
           						transition-colors duration-150" id="TotalMatches" >
								<span id="TotalMatchesText"></span><svg id="WinsSortIcon" xmlns="http://www.w3.org/2000/svg"
										fill="none" viewBox="0 0 24 24" stroke="currentColor"
										class="w-4 h-4 opacity-50 transition-transform duration-150">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
										d="M19 9l-7 7-7-7" />
									</svg></th>
							<th class="py-2 px-2 text-white font-semibold text-xs lg:text-sm cursor-pointer select-none hover:bg-white/10 active:bg-white/20
         						transition-colors duration-150" id="WinRate">
								<span id="WinRateText"></span><svg id="WinsSortIcon" xmlns="http://www.w3.org/2000/svg"
										fill="none" viewBox="0 0 24 24" stroke="currentColor"
										class="w-4 h-4 opacity-50 transition-transform duration-150">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
										d="M19 9l-7 7-7-7" />
									</svg></th>
						</tr>
						</thead>
						<tbody id="RankTableBody">
							${rankTableCreator(rank_array)}
						</tbody>
					</table>
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
							<td data-player="pl_${match.player1_username}" class="pl_${match.player1_username} cursor-pointer select-none hover:bg-white/10 active:bg-white/20
          						transition-colors duration-150 py-2 px-2 text-white font-medium text-xs lg:text-sm truncate max-w-[80px]">${match.player1_username}</td>
							<td data-player="pl_${match.player2_username}" class="pl_${match.player2_username} cursor-pointer select-none hover:bg-white/10 active:bg-white/20
          						transition-colors duration-150 py-2 px-2 text-white font-medium text-xs lg:text-sm truncate max-w-[80px]">${match.player2_username}</td>
							<td class="py-2 px-2 text-white font-medium text-xs lg:text-sm">${match.player1_score}</td>
							<td class="py-2 px-2 text-white font-medium text-xs lg:text-sm">${match.player2_score}</td>
							<td data-player="pl_${match.winner_username}" class="pl_${match.winner_username} cursor-pointer select-none hover:bg-white/10 active:bg-white/20
          						transition-colors duration-150 py-2 px-2 text-white font-medium text-xs lg:text-sm">${match.winner_username}</td>
							<td class="py-2 px-2 text-white font-medium text-xs lg:text-sm">${match.is_tournament_match ? 'Yes' : 'No'}</td>
							<td class="py-2 px-2 text-gray-300 text-xs hidden lg:table-cell">${new Date(match.played_at).toLocaleString()}</td>
						  </tr>
						`).join('')}
					  </tbody>
					</table>
				  </div>
			  
				</div>
			  `);
		//----event listeners for every rank column
		var  wins = document.getElementById("Wins") as HTMLTableColElement;
		var trophies = document.getElementById("Trophies") as HTMLTableColElement;
		var rank_total_matches = document.getElementById("TotalMatches") as HTMLTableColElement;
		var win_rate = document.getElementById("WinRate") as HTMLTableColElement;
		var rankTableBody = document.getElementById("RankTableBody") as HTMLTableSectionElement
		wins.addEventListener("click",
			()=>rankTableBody.innerHTML = rankTableCreator(rank_array.sort((rank1, rank2)=>rank2.wins -rank1.wins)) //sort ? rank1.wins < rank2.wins => rank2 -rank1 
		)
		trophies.addEventListener("click",
			()=> rankTableBody.innerHTML = rankTableCreator(rank_array.sort((rank1, rank2)=>rank2.trophies -rank1.trophies))
		)
		rank_total_matches.addEventListener("click",
			()=> rankTableBody.innerHTML = rankTableCreator(rank_array.sort((rank1, rank2)=>rank2.total_matches -rank1.total_matches))
		)
		win_rate.addEventListener("click",
			()=> rankTableBody.innerHTML = rankTableCreator(rank_array.sort((rank1, rank2)=>rank2.win_rate -rank1.win_rate))
		)
		//----adding event listener for each individual user
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
								// console.log(`${opponent} was pushed`);
							})
							var op_array_unique: { name: string, total_matches: number, individual_wins: number, individual_win_rate: number }[] = [];
							op_array.forEach(
								op=> {!op_array_unique.some(unique=> unique.name == op.name) ? 
											op_array_unique.push({name: op.name,total_matches: 0,individual_wins: 0,individual_win_rate: 0}) : null;
											// console.log (`${op.name} is unique`);
										
										})
							//-- for to be parsed they need the players per persong the matches and the win rates
							console.log(`Hovered on the ${pr_name}`);
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
							const individualNameEl = document.getElementById("IndividualName");
							if (individualNameEl) {
							individualNameEl.textContent = pr_name;
							}
							const IndidualTotalGamesChartEl = document.getElementById("IndividualTotalGamesChart");
							if (IndidualTotalGamesChartEl) {
							IndidualTotalGamesChartEl.innerHTML = pr_total_games_chrt_string;
							}
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
							const WinRateNameEl = document.getElementById("WinRateName");
							if (WinRateNameEl) {
							WinRateNameEl.textContent = pr_name;
							}
							const WinRateChartEl = document.getElementById("WinRateChart");
							if (WinRateChartEl) {
							WinRateChartEl.innerHTML = pr_win_rate_chart_string;
							}
						}))
			})
		
		addMatchSummaryTranslations(languageStore.language);
		languageStore.subscribe((lang) => addMatchSummaryTranslations(lang));
		initGlobalLanguageSelector();
		
	} catch (e: any) {
		alert(e.message);
		renderConnectionErrorPage();
	};

}