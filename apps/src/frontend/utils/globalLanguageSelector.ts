// DESIGN change: Created global language selector initialization utility
// - Handles event listeners for the floating language button on all pages
// - Uses 100ms timeout to ensure DOM is ready after page render
// - Clones button element to prevent duplicate event listeners
// - Automatically syncs with languageStore for language changes
// - Works with layout.ts global selector HTML
import { languageStore } from '../pages/languages.js';
import type { Language } from '../frontendTypes.js';

export function initGlobalLanguageSelector() {
	// DESIGN change: 100ms delay ensures DOM elements are ready after page render
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

		// DESIGN change: Clone button to remove any previous event listeners
		// This prevents duplicate listeners when navigating between pages
		const newLangToggle = langToggle.cloneNode(true) as HTMLElement;
		langToggle.parentNode?.replaceChild(newLangToggle, langToggle);

		newLangToggle.addEventListener('click', (e) => {
			e.stopPropagation();
			const dropdown = document.getElementById('global-lang-dropdown');
			const arrow = document.getElementById('global-lang-arrow');
			if (dropdown) {
				const isHidden = dropdown.classList.contains('hidden');
				dropdown.classList.toggle('hidden');
				// DESIGN change: Rotate arrow 180deg when dropdown opens
				if (arrow) {
					arrow.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
				}
			}
		});

		// DESIGN change: Close dropdown when clicking anywhere outside
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

		// DESIGN change: Re-query options to ensure we get the latest DOM state
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

		// DESIGN change: Subscribe to language store changes to keep UI in sync
		languageStore.subscribe((lang) => {
			const currentLang = document.getElementById('global-current-lang');
			if (currentLang) {
				currentLang.textContent = lang;
			}
		});
	}, 100);
}
