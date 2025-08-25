type Language = 'EN' | 'DE' | 'GR';

class LanguageStore {
	private _language: Language = 'EN';
	private listeners: ((lang : Language) => void)[] = [];

	set language(lang: Language)
	{
		this._language = lang;
		this.listeners.forEach(cb => cb(lang));
	}

	get language()
	{
		return this._language;
	}
	subscribe(cb: (lang: Language) => void)
	{
		this.listeners.push(cb);
	}
} 

export const languageStore = new LanguageStore();