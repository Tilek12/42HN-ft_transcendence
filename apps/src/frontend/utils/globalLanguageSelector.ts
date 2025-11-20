import { languageStore } from '../pages/languages.js';
import type { Language } from '../types.js';

export function initGlobalLanguageSelector() {
	// Use setTimeout to ensure DOM is ready
	setTimeout(() => {
		const langToggle = document.getElementById('global-lang-toggle');
		const langDropdown = document.getElementById('global-lang-dropdown');
		const langOptions = document.querySelectorAll('.global-lang-option');
		const currentLangSpan = document.getElementById('global-current-lang');
		const langArrow = document.getElementById('global-lang-arrow');

		if (!langToggle || !langDropdown || !currentLangSpan) {
			console.log('Global language selector elements not found');
			return; // Elements not found, likely on a page without the global selector
		}

		console.log('Initializing global language selector');

		// Set initial language
		currentLangSpan.textContent = languageStore.language;

		// Remove any existing event listeners by cloning
		const newLangToggle = langToggle.cloneNode(true) as HTMLElement;
		langToggle.parentNode?.replaceChild(newLangToggle, langToggle);

		newLangToggle.addEventListener('click', (e) => {
			e.stopPropagation();
			const dropdown = document.getElementById('global-lang-dropdown');
			const arrow = document.getElementById('global-lang-arrow');
			if (dropdown) {
				const isHidden = dropdown.classList.contains('hidden');
				dropdown.classList.toggle('hidden');
				if (arrow) {
					arrow.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
				}
			}
		});

		document.addEventListener('click', () => {
			const dropdown = document.getElementById('global-lang-dropdown');
			const arrow = document.getElementById('global-lang-arrow');
			if (dropdown) {
				dropdown.classList.add('hidden');
			}
			if (arrow) {
				arrow.style.transform = 'rotate(0deg)';
			}
		});

		// Re-query langOptions after potential DOM updates
		const updatedLangOptions = document.querySelectorAll('.global-lang-option');
		updatedLangOptions.forEach(option => {
			option.addEventListener('click', (e) => {
				const lang = (e.currentTarget as HTMLButtonElement).dataset.lang;
				if (lang) {
					languageStore.language = lang as Language;
					const currentLang = document.getElementById('global-current-lang');
					const dropdown = document.getElementById('global-lang-dropdown');
					const arrow = document.getElementById('global-lang-arrow');
					
					if (currentLang) {
						currentLang.textContent = lang;
					}
					if (dropdown) {
						dropdown.classList.add('hidden');
					}
					if (arrow) {
						arrow.style.transform = 'rotate(0deg)';
					}
				}
			});
		});

		// Subscribe to language changes
		languageStore.subscribe((lang) => {
			const currentLang = document.getElementById('global-current-lang');
			if (currentLang) {
				currentLang.textContent = lang;
			}
		});
	}, 100);
}
