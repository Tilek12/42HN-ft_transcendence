
import { initGlobalLanguageSelector } from "../utils/globalLanguageSelector.js";
import { renderBackgroundFull } from "../utils/layout.js"
import {languageStore, translations_main_page, transelate_per_id} from './languages.js';


export function renderMainPage(root: HTMLElement) {
	const t = translations_main_page[languageStore.language];
	root.innerHTML = renderBackgroundFull(
		/*html*/
		`<div class=" flex flex-col justify-center items-center text-center text-white p-20">
			<h1 id="main_welcome_header" class="text-4xl font-bold mb-4">${t!.main_welcome_header}</h1>
			<p id="main_subtitle" class="text-gray-400 mb-6">${t!.main_subtitle}</p>
			<a id="main_view_game_btn" href="#/game" class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition">
			${t!.main_view_game_btn}
			</a>
		</div>
	`);
	

	languageStore.subscribe((lang) => {
		transelate_per_id(translations_main_page,"main_welcome_header", lang, "main_welcome_header");
		transelate_per_id(translations_main_page,"main_subtitle", lang, "main_subtitle");
		transelate_per_id(translations_main_page,"main_view_game_btn", lang, "main_view_game_btn");
	});
	initGlobalLanguageSelector();
}
