import { renderNav } from './nav'
import { createBouncingBall, BouncingBall } from './bouncingBall';


export function renderProfile(root: HTMLElement) {
  root.innerHTML = renderNav() + `
    <div class="fixed inset-0 bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
      <div class="fixed inset-0 opacity-20 pointer-events-none">
        <div id="bouncing-ball" class="absolute w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      <div class="h-screen pt-20 p-4 overflow-y-auto">
        <div class="max-w-6xl mx-auto h-full grid grid-cols-1 lg:grid-cols-3 gap-6 content-start">
          
          <!-- Profile Header Card -->
          <div class="lg:col-span-3">
            <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
              <div class="flex flex-col md:flex-row items-center gap-8">
                
                <!-- Avatar Section -->
                <div class="flex-shrink-0">
                  <label for="profileUpload" class="relative block w-32 h-32 rounded-full overflow-hidden cursor-pointer border-4 border-white/30 hover:border-purple-400 group transition-all duration-300 shadow-xl">
                    <img id="profilePreview" src="/default-avatar.png" alt="Profile" class="w-full h-full object-cover" />
                    <div class="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-medium transition-opacity duration-300">
                      <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      Change Avatar
                    </div>
                    <input id="profileUpload" type="file" accept="image/*" class="hidden" onchange="previewProfile(this)" />
                  </label>
                  <div class="text-center mt-3">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100/20 text-green-300 border border-green-400/30">
                      <div class="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                      Online
                    </span>
                  </div>
                </div>

                <!-- User Info Section -->
                <div class="flex-grow text-center md:text-left">
                  <div class="mb-4">
                    <h1 class="text-4xl font-bold text-white mb-2" id="userName">Rustam Yusupov</h1>
                    <p class="text-xl text-purple-300 mb-1" id="userLogin">@ryusupov</p>
                    <p class="text-gray-300" id="userEmail">rustam.yusupov@student.42.fr</p>
                  </div>
                  
                  <!-- Quick Stats -->
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div class="text-center">
                      <div class="text-2xl font-bold text-white" id="totalScore">2,450</div>
                      <div class="text-sm text-gray-300">Total Score</div>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold text-green-400" id="gamesWon">127</div>
                      <div class="text-sm text-gray-300">Games Won</div>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold text-red-400" id="gamesLost">43</div>
                      <div class="text-sm text-gray-300">Games Lost</div>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold text-yellow-400" id="winRate">74.7%</div>
                      <div class="text-sm text-gray-300">Win Rate</div>
                    </div>
                  </div>
                </div>

                <!-- Level & Rank Badge -->
                <div class="flex-shrink-0 text-center">
                  <div class="relative">
                    <div class="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      <span id="userLevel">15</span>
                    </div>
                    <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <span class="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-semibold">Level</span>
                    </div>
                  </div>
                  <div class="mt-4">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                      🏆 Champion
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Personal Information Card -->
          <div class="lg:col-span-2 h-fit">
            <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
              <h2 class="text-2xl font-bold text-white mb-6 flex items-center">
                <svg class="w-6 h-6 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Personal Information
              </h2>
              
              <form class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                    <input type="text" id="firstName" value="Rustam" class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                    <input type="text" id="lastName" value="Yusupov" class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300">
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Username</label>
                  <input type="text" id="username" value="ryusupov" class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                  <textarea id="userBio" rows="3" placeholder="Tell us about yourself..." class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none">42 Student passionate about coding and pong mastery! 🏓</textarea>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Campus</label>
                  <select id="campus" class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300">
                    <option value="42-heilbronn" class="bg-gray-800">42 Heilbronn</option>
                    <option value="42-paris" class="bg-gray-800">42 Paris</option>
                    <option value="42-madrid" class="bg-gray-800">42 Madrid</option>
                    <option value="42-tokyo" class="bg-gray-800">42 Tokyo</option>
                  </select>
                </div>
                
                <button type="submit" class="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg" onclick="updateProfile()">
                  Update Profile
                </button>
              </form>
            </div>
          </div>

          <!-- Game Statistics Card -->
          <div class="space-y-6 h-fit">
            <!-- Achievement Badges -->
            <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
              <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                <svg class="w-5 h-5 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                Achievements
              </h3>
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-3 text-center">
                  <div class="text-2xl mb-1">🏆</div>
                  <div class="text-xs text-yellow-300 font-medium">First Win</div>
                </div>
                <div class="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-3 text-center">
                  <div class="text-2xl mb-1">🔥</div>
                  <div class="text-xs text-purple-300 font-medium">Win Streak</div>
                </div>
                <div class="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg p-3 text-center">
                  <div class="text-2xl mb-1">⚡</div>
                  <div class="text-xs text-blue-300 font-medium">Speed Demon</div>
                </div>
                <div class="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-3 text-center">
                  <div class="text-2xl mb-1">🎯</div>
                  <div class="text-xs text-green-300 font-medium">Perfectionist</div>
                </div>
              </div>
            </div>

            <!-- Progress & Level -->
            <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
              <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                <svg class="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                Level Progress
              </h3>
              <div class="space-y-4">
                <div>
                  <div class="flex justify-between text-sm text-gray-300 mb-2">
                    <span>Level 15</span>
                    <span>2,450 / 3,000 XP</span>
                  </div>
                  <div class="w-full bg-gray-700 rounded-full h-3">
                    <div class="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500" style="width: 81.6%"></div>
                  </div>
                  <div class="text-center text-xs text-gray-400 mt-2">550 XP to next level</div>
                </div>
              </div>
            </div>

            <!-- Security Settings -->
            <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
              <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                <svg class="w-5 h-5 mr-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                Security
              </h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-gray-300 text-sm">Two-Factor Auth</span>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="" class="sr-only peer" checked onchange="toggleTwoFA()">
                    <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                <button class="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 font-medium py-2 px-4 rounded-lg transition-all duration-300 text-sm">
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Initialize bouncing ball
  createBouncingBall('bouncing-ball');
}

// Profile functionality
declare global {
  function previewProfile(input: HTMLInputElement): void;
  function updateProfile(): void;
  function toggleTwoFA(): void;
}

// Profile image preview function
window.previewProfile = function(input: HTMLInputElement) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const preview = document.getElementById('profilePreview') as HTMLImageElement;
      if (preview && e.target?.result) {
        preview.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(input.files[0]);
  }
};

// Update profile function
window.updateProfile = function() {
  // Get form data
  const firstName = (document.getElementById('firstName') as HTMLInputElement)?.value;
  const lastName = (document.getElementById('lastName') as HTMLInputElement)?.value;
  const username = (document.getElementById('username') as HTMLInputElement)?.value;
  const bio = (document.getElementById('userBio') as HTMLTextAreaElement)?.value;
  const campus = (document.getElementById('campus') as HTMLSelectElement)?.value;
  
  // Update header display
  const userNameElement = document.getElementById('userName');
  const userLoginElement = document.getElementById('userLogin');
  
  if (userNameElement && firstName && lastName) {
    userNameElement.textContent = `${firstName} ${lastName}`;
  }
  
  if (userLoginElement && username) {
    userLoginElement.textContent = `@${username}`;
  }
  
  // Show success message
  const button = event?.target as HTMLButtonElement;
  if (button) {
    const originalText = button.textContent;
    button.textContent = 'Updated!';
    button.classList.add('bg-green-600');
    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('bg-green-600');
    }, 2000);
  }
  
  console.log('Profile updated:', { firstName, lastName, username, bio, campus });
};

// Toggle Two-Factor Authentication
window.toggleTwoFA = function() {
  const toggle = event?.target as HTMLInputElement;
  if (toggle) {
    const status = toggle.checked ? 'enabled' : 'disabled';
    console.log(`Two-Factor Authentication ${status}`);
    
    // Show notification
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 bg-${toggle.checked ? 'green' : 'red'}-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300`;
    notification.textContent = `2FA ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
};
