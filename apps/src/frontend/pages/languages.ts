type Language = 'EN' | 'DE' | 'GR';

class LanguageStore {
	private _language: Language = 'EN';
	private listeners: ((lang : Language) => void)[] = [];
	private _clicked: number = 0;

	set language(lang: Language)
	{
		this._language = lang;
		this.listeners.forEach(cb => cb(lang));
	}

	get language()
	{
		return this._language;
	}
	set clicked(cl: number)
	{
		this._clicked = cl;
	}
	get clicked()
	{
		return this._clicked;
	}
	subscribe(cb: (lang: Language) => void)
	{
		this.listeners.push(cb);
	}
} 

export const languageStore = new LanguageStore();