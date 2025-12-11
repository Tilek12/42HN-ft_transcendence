// DESIGN change: Added global floating language selector to background layout
// - Removed language selector from navigation header (nav.ts)
// - Moved to global layout so it appears on ALL pages consistently
// - Fixed bottom-right position, above all content (z-50)
// - Dropdown opens upward with glassmorphism design
// - Initialized via globalLanguageSelector.ts on each page render
export function renderBackgroundFull(content: string): string {
	return (
		/*html*/
		`
		<!-- Animated background elements -->
		<div class="fixed inset-0 opacity-20 pointer-events-none">
			<div class="absolute top-40 left-20 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
			<div class="absolute top-60 right-10 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
			<div class="absolute bottom-32 left-1/2 w-72 h-72 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
		</div>
		
		<!-- DESIGN change: Global Floating Language Selector -->
		<!-- Appears on all pages that use renderBackgroundFull() -->
		<!-- Modern glassmorphism button with hover effects and upward dropdown -->
		<div class="fixed bottom-8 right-8 z-50 pointer-events-auto">
			<div class="relative">
				<button id="global-lang-toggle" class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-md border border-white/30 rounded-full text-white hover:border-white/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
					</svg>
					<span id="global-current-lang" class="font-medium text-sm">EN</span>
					<svg class="w-4 h-4 transition-transform duration-300" id="global-lang-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
					</svg>
				</button>
				<!-- DESIGN change: Dropdown opens UPWARD (bottom-full) with flag emojis for visual appeal -->
				<div id="global-lang-dropdown" class="hidden absolute bottom-full right-0 mb-3 w-48 bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
					<button data-lang="EN" class="global-lang-option w-full px-4 py-3 text-white hover:bg-white/10 transition-colors duration-200 text-left flex items-center gap-3">
						<span class="text-xl">🇬🇧</span>
						<span>English</span>
					</button>
					<button data-lang="DE" class="global-lang-option w-full px-4 py-3 text-white hover:bg-white/10 transition-colors duration-200 text-left flex items-center gap-3 border-t border-white/10">
						<span class="text-xl">🇩🇪</span>
						<span>Deutsch</span>
					</button>
					<button data-lang="GR" class="global-lang-option w-full px-4 py-3 text-white hover:bg-white/10 transition-colors duration-200 text-left flex items-center gap-3 border-t border-white/10">
						<span class="text-xl">🇬🇷</span>
						<span>Ελληνικά</span>
					</button>
				</div>
			</div>
		</div>
		
		<div class="flex-col flex items-center justify-center p-4 w-full">
			${content}
		</div>
	`);
}

// export function renderBackgroundTop(content: string): string {
// 	return (
// 		/*html*/
// 		`
// 		<!-- Animated background elements -->
// 		<div class="fixed inset-0 opacity-20 pointer-events-none">
// 			<div class="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
// 			<div class="absolute top-60 right-10 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
// 			<div class="absolute bottom-32 left-1/2 w-72 h-72 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
// 		</div>
// 		${content}
		
// 	`);
// }
