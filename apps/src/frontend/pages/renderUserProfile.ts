import { renderBackgroundFull } from '../utils/layout.js';
import { wsManager } from '../websocket/ws-manager.js';
import type { Language, fUser } from '../frontendTypes.js';
import { defaultPicture } from '../utils/constants.js';
import { languageStore, translations_profile, transelate_per_id } from './languages.js'
import { getUser } from '../utils/auth.js';



let lastPresence: string[] | undefined = [];


export const fill_profile_info = () => {

	const user = getUser();
	if (!user){
		// alert("HAHA");
		return;
	}

	let username 	= document.getElementById('username');
	let wins 		= document.getElementById('wins');
	let losses 		= document.getElementById('losses');
	let trophies 	= document.getElementById('trophies');
	let created_at 	= document.getElementById('created_at');
	let profile_pic = document.getElementById('profile_picture');

	if (username && wins && losses && trophies && created_at && profile_pic) {
		username.innerText = ` ${user.username}`;
		wins.innerText = ` ${user.wins}`;
		losses.innerText = ` ${user.losses}`;
		trophies.innerText = ` ${user.trophies}`;
		created_at.innerText = ` ${new Date(user.created_at).toLocaleString()}`;
		(profile_pic as HTMLImageElement).src = user.image_blob ? `data:image/webp;base64,${user.image_blob}` : defaultPicture;
	}
};

export const update_langauge_headers_user_profile = (lang: Language) => {
	// const your_header_profile = document.getElementById("your_profile_header") as HTMLHeadElement;
	transelate_per_id(translations_profile, "your_profile", lang, "your_profile_header");
	transelate_per_id(translations_profile, "user_list", lang, "user_list_header");
	transelate_per_id(translations_profile, "friends_list", lang, "friend_list_header");
	transelate_per_id(translations_profile, "request_list", lang, "friend_requests_header");
	transelate_per_id(translations_profile, "joined", lang, "joined_header");
	transelate_per_id(translations_profile, "wins", lang, "wins_header");
	transelate_per_id(translations_profile, "losses", lang, "losses_header");
	transelate_per_id(translations_profile, "trophies", lang, "trophies_header");
	transelate_per_id(translations_profile, "match_history", lang, "match_history_header");
	transelate_per_id(translations_profile, "load_more", lang, "load_more_header");
	transelate_per_id(translations_profile, "username", lang, "username_header");
	transelate_per_id(translations_profile, "no_match_history", lang, "no_match_history_span")
	transelate_per_id(translations_profile, "no_friend_requests", lang, "no_requests_span")
	transelate_per_id(translations_profile, "no_friends", lang, "no_friends_span")
	transelate_per_id(translations_profile, "no_users", lang, "no_user_list_span")


}
export function renderUserProfile()
{
	
	// DESIGN CHANGE: Complete 3-column layout redesign with glass-morphism and larger sizing
	// - Changed from compact layout to full-screen (95% width)
	// - Added pt-24 for header spacing
	// - Implemented 3-column grid: Profile (3/12) | Info (5/12) | History (4/12)
	// - All sections use glass-morphism (bg-white/10 + backdrop-blur-md)
	// - Increased all sizes: profile pic (224px), fonts (text-base to text-4xl), padding (p-8)
	// - Added hover animations (scale-105) and enhanced shadows
	return renderBackgroundFull(
		/*html*/
		`
		<div class="h-full w-full">
			<div class="max-w-[1800px] mx-auto px-4 py-8">
				<!-- DESIGN: 3-column responsive grid using Tailwind's 12-column system -->
				<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8">
					
					<!-- ========== LEFT COLUMN: Profile Picture + Stats + Logout ========== -->
					<!-- DESIGN: Takes 3/12 columns (25% width) -->
					<div class="lg:col-span-3 w-full">
						<!-- DESIGN: Glass-morphism card with hover shadow effect -->
						<div class="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-4 lg:p-6 border border-black/20 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
							
							<!-- Profile Picture Section -->
							<!-- Upload, update, and delete profile picture -->
							<!-- DESIGN: Large circular image (224px) with online indicator -->
				
								<div class="relative w-40 h-40 lg:w-48 lg:h-48 mx-auto mb-6">
									<img id="profile_picture" src="" alt="Profile" class="w-full h-full object-cover rounded-full border-4 border-white/30 shadow-xl transition-all duration-300 hover:scale-105">
									<div id="logged_in" class="absolute bottom-1 right-1 w-6 h-6 lg:w-8 lg:h-8 bg-green-500 rounded-full border-4 border-white shadow-lg animate-pulse "></div>
								</div>
							
							<!-- Stats Section -->
							<!-- Wins, Losses, Trophies display -->
							<!-- DESIGN: Color-coded stats (green/red/yellow) with large numbers (text-4xl) -->
							<div class="grid grid-cols-3 gap-2 lg:gap-3">
								<div class="bg-green-500/20 rounded-xl p-3 lg:p-4 text-center transition-all duration-300 hover:scale-105 hover:bg-green-500/30">
									<div class="text-2xl lg:text-3xl font-bold text-green-400" id="wins"></div>
									<div class="text-xs lg:text-sm text-gray-300 mt-1" id="wins_header"></div>
								</div>
								<div class="bg-red-500/20 rounded-xl p-3 lg:p-4 text-center transition-all duration-300 hover:scale-105 hover:bg-red-500/30">
									<div class="text-2xl lg:text-3xl font-bold text-red-400" id="losses"></div>
									<div class="text-xs lg:text-sm text-gray-300 mt-1" id="losses_header"></div>
								</div>
								<div class="bg-yellow-500/20 rounded-xl p-3 lg:p-4 text-center transition-all duration-300 hover:scale-105 hover:bg-yellow-500/30">
									<div class="text-2xl lg:text-3xl font-bold text-yellow-400" id="trophies"></div>
									<div class="text-xs lg:text-sm text-gray-300 mt-1" id="trophies_header"></div>
								</div>
							</div>
						</div>
						<!--Friend request list-->
						<div class="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-4 lg:p-6 border border-black/20 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] mt-6">
				  			<h2 class="text-xl font-bold text-white mb-4 flex items-center">
								<svg class="w-6 h-6 mr-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
									</svg>
								<span id="friend_requests_header"></span>
							</h2>
							<div id="friend-requests-list"></div>
							<span id="no_requests_span" class="text-xl hidden font-bold text-gray-300 mb-4 flex items-center"></span>	
							<span id="friend_requests_error" class="text-xl hidden font-bold text-red-600 mb-4 flex items-center"></span>	
						</div>	
						
					</div>
					
					<!-- ========== MIDDLE COLUMN: Profile Info + Security ========== -->
					<!-- DESIGN: Takes 5/12 columns (42% width) - largest column for main content -->
					<div class="lg:col-span-5 w-full space-y-6">
						
						<!-- Profile Information Section -->
						<!-- Username, Email, Join Date -->
						<!-- DESIGN: Glass-morphism card with SVG icons -->
						<div class="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-4 lg:p-6 border border-black/20 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
							<h2 id="your_profile_header" class="text-xl font-bold text-white mb-4 flex items-center">
								<svg class="w-7 h-7 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
								</svg>
							</h2>
							
							<!-- Update Username Section -->
							<!-- DESIGN: Inline edit with show/hide toggle, border highlight on hover -->
							<div class="bg-white/5 rounded-xl p-5 mb-4 border-l-4 border-transparent hover:border-blue-500 transition-all duration-300">
								<div class="flex items-center mb-4">
									<span class="text-gray-300 text-lg font-medium mr-3" id="username_header"></span>
									<span class="text-white text-lg font-semibold" id="username"></span>
								</div>
							</div>

							<!-- Join Date Display Section -->
							<!-- DESIGN: Read-only fields with SVG icons and border animation on hover -->
							<div class="space-y-4">
								<div class="flex items-center bg-white/5 rounded-xl p-5 border-l-4 border-transparent hover:border-pink-500 transition-all duration-300">
									<svg class="w-6 h-6 mr-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
									</svg>
									<span class="text-gray-300 text-base font-medium" id="joined_header"></span>
									<span class="text-white text-base ml-3" id="created_at"></span>
								</div>
							</div>
						</div>

						
						<!-- Friends List -->
						<div class="bg-white/10 rounded-2xl shadow-2xl p-4 lg:p-6 border border-black/20 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
							<h2 class="text-xl font-bold text-white mb-4 flex items-center">
								<svg class="w-6 h-6 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
									</svg>
								<span id="friend_list_header"></span>
							</h2>
							 <!--button id="triggerfriendrequest" class ="bg-black-500 tranform hover:scale-105 ">trigger '/friends' request </button-->
							<div id="friend-list"></div>
							<span id="no_friends_span" class="text-xl hidden font-bold text-gray-300 mb-4 flex items-center"></span>	
							<span id="friend_list_error" class="text-xl hidden font-bold text-red-600 mb-4 flex items-center"></span>						
						</div>
					</div>

					<!-- ========== RIGHT COLUMN: Match History + Users List ========== -->
					<!-- DESIGN: Takes 4/12 columns (33% width) - scrollable sections -->
					<div class="lg:col-span-4 w-full space-y-6">
						
						<!-- Match History Section -->
						<!-- Scrollable list of past matches -->
						<!-- DESIGN: Sticky header, max-height 350px with scroll, populated by profile.ts -->
						<div class="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-4 lg:p-6 border border-black/20 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
							<h2 class="text-xl font-bold text-white mb-4 flex items-center">
								<svg class="w-7 h-7 mr-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
								</svg>
								<span id="match_history_header"></span>
							</h2>
							<!-- DESIGN: Scrollable container with custom scrollbar styling -->
							<div id="match-history" class="max-h-[300px] lg:max-h-[350px] overflow-y-auto overflow-x-hidden pr-1">
								<span id="no_match_history_span" class="text-xl hidden font-bold text-gray-300 mb-4 flex items-center"></span>	
								<span id="match_history_error" class="text-xl hidden font-bold text-red-600 mb-4 flex items-center"></span>	
							</div>
						</div>

						<!-- Users List Section -->
						<!-- Load more users functionality -->
						<!-- DESIGN: Scrollable list (320px) with gradient "Load More" button -->
						<div class="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-4 lg:p-6 border border-black/20 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
							<!-- DESIGN: User profiles populated by renderProfiles.ts -->
							
							<h2 class="text-xl font-bold text-white mb-4 flex items-center">
								<svg class="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
								</svg>
								<span id="user_list_header"></span>
							</h2>
							<div id="profiles-list" class="max-h-[400px] overflow-y-auto overflow-x-hidden pr-1 mb-4 rounded-xl">
							</div>
							<!-- DESIGN: Multi-color gradient button (blue-purple-pink) -->
							<!--button id="more-profiles-btn" class="w-full px-4 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white text-base font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-2xl">
								<span id="load_more_header"></span>
							</button-->
							<span id="no_user_list_span" class="text-xl hidden font-bold text-gray-300 mb-4 flex items-center"></span>	
							<span id="user_list_error" class="text-xl hidden font-bold text-red-600 mb-4 flex items-center"></span>
						</div>
					</div>
				</div>
			</div>
        </div>`);
	
		// requestAnimationFrame(()=>renderUserProfile(backend_url,data));
	// END OF DESIGN CHANGES - Summary:
	// Layout: 3-column grid (3-5-4 ratio) replacing previous compact design
	// Sizing: Increased from small to large (profile: 224px, fonts: up to text-4xl, padding: p-8)
	// Visual: Glass-morphism theme with backdrop-blur-md, semi-transparent backgrounds
	// Interactive: Hover animations (scale-105), gradient buttons, color-coded stats
	// Spacing: pt-24 added to prevent header overlap, gap-8 between columns
	// Scrolling: Match history (350px) and users list (320px) are scrollable
}