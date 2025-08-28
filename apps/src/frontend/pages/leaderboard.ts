import { renderNav } from './nav'
import { renderBackgroundTop } from '../utils/layout'
import { initLang } from './nav';
import {languageStore} from './languages';
import type {Language} from './languages'

const translations_leaderboards: Record<Language, { [key: string]: string }> = {
    EN: {
        leaderboard_ld_header: 'Leaderboard',
        top_player_ld_header: 'Top players.',
        username_ld_header: 'Username',
        wins_ld_header: 'Wins',
        losses_ld_header: 'Losses',
        trophies_ld_header: 'Trophies',
        matches_played_ld_header: 'Matches Played',
        wins_in_tour_ld_header: 'Wins in Tournament',
        failed_ld_header: 'Failed to load leaderboard'
    },
    DE: {
        leaderboard_ld_header: 'Bestenliste',
        top_player_ld_header: 'Top-Spieler.',
        username_ld_header: 'Benutzername',
        wins_ld_header: 'Siege',
        losses_ld_header: 'Niederlagen',
        trophies_ld_header: 'Trophäen',
        matches_played_ld_header: 'Gespielte Spiele',
        wins_in_tour_ld_header: 'Siege im Turnier',
        failed_ld_header: 'Fehler beim Laden der Bestenliste'
    },
    GR: {
        leaderboard_ld_header: 'Πίνακας Κατάταξης',
        top_player_ld_header: 'Κορυφαίοι παίκτες.',
        username_ld_header: 'Όνομα Χρήστη',
        wins_ld_header: 'Νίκες',
        losses_ld_header: 'Ήττες',
        trophies_ld_header: 'Τρόπαια',
        matches_played_ld_header: 'Αγώνες που παίχτηκαν',
        wins_in_tour_ld_header: 'Νίκες στο Τουρνουά',
        failed_ld_header: 'Αποτυχία φόρτωσης πίνακα κατάταξης'
    }
};

export async function renderLeaderboard(root: HTMLElement) {
	const tr =  translations_leaderboards[languageStore.language];

  try {
	// 
    const tournamentId = 1;
    const res = await fetch(`/api/tournament/${tournamentId}/leaderboard`);

    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }

    const leaderboard = await res.json();


    root.innerHTML =renderBackgroundTop(`
      <div class="pt-24 max-w-xl mx-auto text-white text-center mb-6">
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
		const tr =  translations_leaderboards[lang];
		const leaderboardHeaderEl = document.getElementById("leaderboard_ld_header");
		if (leaderboardHeaderEl) leaderboardHeaderEl.innerHTML = tr.leaderboard_ld_header;
		
		const topPlayerHeaderEl = document.getElementById("top_player_ld_header");
		if (topPlayerHeaderEl) topPlayerHeaderEl.innerHTML = tr.top_player_ld_header;
		
		const usernameHeaderEl = document.getElementById("username_ld_header");
		if (usernameHeaderEl) usernameHeaderEl.innerHTML = tr.username_ld_header;
		
		const winsHeaderEl = document.getElementById("wins_ld_header");
		if (winsHeaderEl) winsHeaderEl.innerHTML = tr.wins_ld_header;
		
		const lossesHeaderEl = document.getElementById("losses_ld_header");
		if (lossesHeaderEl) lossesHeaderEl.innerHTML = tr.losses_ld_header;
		
		const trophiesHeaderEl = document.getElementById("trophies_ld_header");
		if (trophiesHeaderEl) trophiesHeaderEl.innerHTML = tr.trophies_ld_header;
		
		const matchesPlayedHeaderEl = document.getElementById("matches_played_ld_header");
		if (matchesPlayedHeaderEl) matchesPlayedHeaderEl.innerHTML = tr.matches_played_ld_header;
		
		const winsInTourHeaderEl = document.getElementById("wins_in_tour_ld_header");
		if (winsInTourHeaderEl) winsInTourHeaderEl.innerHTML = tr.wins_in_tour_ld_header;
		
	});
  } catch (err: any) {
    root.innerHTML = renderBackgroundTop(`
      <div class="pt-24 text-center text-red-500">
        <p><span id="failed_ld_header">${tr!.failed_ld_header}</span>: ${err.message}</p>
      </div>
    `);
  }
}
