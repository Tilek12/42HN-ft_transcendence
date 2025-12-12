import { Language, PlaceholderElement, TranslationSet } from '../frontendTypes.js'

class LanguageStore {
	private _language: Language = 'EN';
	private _listeners: ((lang: Language) => void)[] = [];
	private _langSelect: HTMLSelectElement | undefined;

	contructor() {
		this._langSelect = undefined;
	}

	set language(lang: Language) {
		if (this._langSelect) {
			this._langSelect.value = lang;
		}
		localStorage.setItem('PongLanguage', lang);
		this._language = lang;
		this._listeners.forEach(cb => cb(lang));
	}

	get language() {
		return this._language;
	}

	subscribe(cb: (lang: Language) => void) {
		this._listeners.push(cb);
	}

	initLang() {
		const langSelect = document.getElementById('language-select') as HTMLSelectElement;
		if (langSelect) {
			this._langSelect = langSelect;
			langSelect.addEventListener('change', () => {
				console.log('clicked');
				const selected = langSelect.value as Language;
				languageStore.language = selected;
			})
		}
	}
}


export function transelate_per_id(tr_set: TranslationSet, key: string, lang: Language, element_id: string) {
	let headerEl = document.getElementById(element_id);
	if (headerEl) {
		let value = tr_set[lang][key];
		if (value) {
			if (key.includes("placeholder") && (headerEl instanceof HTMLInputElement || headerEl instanceof HTMLTextAreaElement)) {
				headerEl.placeholder = value;
			}
			else
				headerEl.innerText = value;
		}
	}
}

export const languageStore = new LanguageStore();