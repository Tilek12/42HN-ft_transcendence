import { renderNav } from "./nav"
import { renderBackgroundFull } from "../utils/layout"
import {languageStore} from './languages';
import type {Language} from './languages';


export const translations_main_page: Record<Language, { [key: string]: string }> = {
	EN: {
		main_welcome_header: 'Welcome to Pong Game!',
		main_subtitle: 'Start the game and prove your skills.',
		main_view_game_btn: 'View Game'
	},
	DE: {
		main_welcome_header: 'Willkommen beim Pong-Spiel!',
		main_subtitle: 'Starte das Spiel und zeige dein Können.',
		main_view_game_btn: 'Spiel anzeigen'
	},
	GR: {
		main_welcome_header: 'Καλώς ήρθες στο παιχνίδι Pong!',
		main_subtitle: 'Ξεκίνα το παιχνίδι και δείξε τις ικανότητές σου.',
		main_view_game_btn: 'Προβολή Παιχνιδιού'
	}
};

export function renderMainPage(root: HTMLElement) {
	const t = translations_main_page[languageStore.language];
	root.innerHTML = renderBackgroundFull(`
	  <div class="h-screen flex flex-col justify-center items-center text-center text-white">
		<h1 id="main_welcome_header" class="text-4xl font-bold mb-4">${t!.main_welcome_header}</h1>
		<p id="main_subtitle" class="text-gray-400 mb-6">${t!.main_subtitle}</p>
		<a id="main_view_game_btn" href="#/game" class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition">
		  ${t!.main_view_game_btn}
		</a>
	  </div>
	`);

	languageStore.subscribe((lang) => {
		const t = translations_main_page[lang];
		const mainWelcomeHeaderEl = document.getElementById('main_welcome_header');
		if (mainWelcomeHeaderEl) mainWelcomeHeaderEl.innerHTML = t.main_welcome_header;
		
		const mainSubtitleEl = document.getElementById('main_subtitle');
		if (mainSubtitleEl) mainSubtitleEl.innerHTML = t.main_subtitle;
		
		const mainViewGameBtnEl = document.getElementById('main_view_game_btn');
		if (mainViewGameBtnEl) mainViewGameBtnEl.innerHTML = t.main_view_game_btn;
		
	});
}
