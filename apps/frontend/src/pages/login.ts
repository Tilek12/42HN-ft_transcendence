import { renderNav } from './nav'
import { saveToken } from '../utils/auth';

export function renderLogin(root: HTMLElement) {
  root.innerHTML = renderNav() + `
    <div class="fixed inset-0 bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
      <!-- Animated background elements -->
      <div class="fixed inset-0 opacity-20 pointer-events-none">
        <div class="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div class="absolute top-60 right-10 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div class="absolute bottom-32 left-1/2 w-72 h-72 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      <div class="flex items-center justify-center h-full p-4">
        <div class="w-full max-w-md">
          <!-- Glassmorphism card -->
          <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
            <!-- Logo/Icon area -->
            <div class="text-center mb-8">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <h1 class="text-3xl font-bold text-white mb-2">Welcome Back</h1>
              <p class="text-gray-300 text-sm">Sign in to continue to your account</p>
            </div>

            <!-- Google login button -->
            <button id="google-login" class="w-full bg-white/10 hover:bg-white/20 border border-white/30 text-white py-3 px-4 rounded-xl mb-6 transition-all duration-300 flex items-center justify-center space-x-3 hover:scale-105 backdrop-blur-sm group">
              <svg class="w-5 h-5 transition-transform group-hover:rotate-12" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span class="font-medium">Continue with Google</span>
            </button>

            <!-- Divider -->
            <div class="relative my-6">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-white/20"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-4 bg-transparent text-gray-300">Or continue with email</span>
              </div>
            </div>

            <!-- Login form -->
            <form id="login-form" class="space-y-6">
              <div class="space-y-1">
                <label for="username" class="block text-sm font-medium text-gray-200">Username</label>
                <div class="relative">
                  <input
                    type="text"
                    id="username"
                    class="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-sm transition-all duration-300 hover:bg-white/15"
                    placeholder="Enter your username"
                    required
                  />
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div class="space-y-1">
                <label for="password" class="block text-sm font-medium text-gray-200">Password</label>
                <div class="relative">
                  <input
                    type="password"
                    id="password"
                    class="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-sm transition-all duration-300 hover:bg-white/15"
                    placeholder="Enter your password"
                    required
                  />
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between text-sm">
                <label class="flex items-center text-gray-300">
                  <input type="checkbox" class="mr-2 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500/50">
                  <span>Remember me</span>
                </label>
                <a href="#/forgot-password" class="text-blue-400 hover:text-blue-300 transition-colors duration-200">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg"
              >
                <span class="flex items-center justify-center space-x-2">
                  <span>Sign In</span>
                  <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                  </svg>
                </span>
              </button>

              <!-- Error message -->
              <div id="login-error" class="hidden">
                <div class="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm backdrop-blur-sm">
                  <div class="flex items-center space-x-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                    <span id="error-text"></span>
                  </div>
                </div>
              </div>
            </form>

            <!-- Register link -->
            <div class="text-center mt-8 pt-6 border-t border-white/10">
              <p class="text-gray-300 text-sm mb-2">Don't have an account?</p>
              <a
                href="#/register"
                class="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200 group"
              >
                <span>Create account</span>
                <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const form = document.getElementById('login-form') as HTMLFormElement;
  const errorContainer = document.getElementById('login-error')!;
  const errorText = document.getElementById('error-text')!;
  const googleBtn = document.getElementById('google-login')!;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Loading state animation
    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `
      <div class="flex items-center justify-center space-x-2">
        <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Signing in...</span>
      </div>
    `;
    submitBtn.disabled = true;

    const username = (document.getElementById('username') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.token) {
        errorText.textContent = data.message || 'Login failed';
        errorContainer.classList.remove('hidden');

        // auto hiding
        setTimeout(() => {
          errorContainer.classList.add('hidden');
        }, 5000);
      } else {
        saveToken(data.token);
        // success animation
        submitBtn.innerHTML = `
          <div class="flex items-center justify-center space-x-2">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Success!</span>
          </div>
        `;

        setTimeout(() => {
          location.hash = '#/profile';
        }, 1000);
      }
    } catch (error) {
      errorText.textContent = 'Network error. Please try again.';
      errorContainer.classList.remove('hidden');
    } finally {
      // resetting btn after delay
      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }, 2000);
    }
  });

  googleBtn.addEventListener('click', async () => {
    // loading animation
    const originalText = googleBtn.innerHTML;
    googleBtn.innerHTML = `
      <div class="flex items-center justify-center space-x-3">
        <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Connecting...</span>
      </div>
    `;

    setTimeout(() => {
      alert('🧪 Google login not implemented yet.');
      googleBtn.innerHTML = originalText;
    }, 1500);

    // Optional: Redirect to OAuth endpoint
    // location.href = '/api/auth/google'
  });
}




// import { renderNav } from './nav'

// export function renderLogin(root: HTMLElement) {
//   root.innerHTML = renderNav() + `
//     <div class="max-w-md mx-auto mt-10 bg-white p-8 rounded shadow">
//       <h1 class="text-3xl font-bold mb-6 text-center">Sign In</h1>

//       <button id="google-login" class="w-full bg-red-500 text-white py-2 px-4 rounded mb-6 hover:bg-red-600">
//         🔒 Login via Google
//       </button>

//       <form id="login-form" class="space-y-6">
//         <div>
//           <label for="username" class="block text-left text-sm font-medium text-gray-700">Username</label>
//           <input type="text" id="username" class="mt-1 block w-full border px-3 py-2 rounded shadow-sm" required />
//         </div>

//         <div>
//           <label for="password" class="block text-left text-sm font-medium text-gray-700">Password</label>
//           <input type="password" id="password" class="mt-1 block w-full border px-3 py-2 rounded shadow-sm" required />
//         </div>

//         <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded">
//           Login
//         </button>

//         <p id="login-error" class="text-red-600 text-sm mt-2 hidden"></p>
//       </form>

//       <div class="text-center mt-6">
//         <p class="text-sm text-gray-600">No account?</p>
//         <a href="#/register" class="text-blue-600 hover:underline font-semibold">Register</a>
//       </div>
//     </div>
//   `;

//   const form = document.getElementById('login-form') as HTMLFormElement;
//   const error = document.getElementById('login-error')!;
//   const googleBtn = document.getElementById('google-login')!;

//   form.addEventListener('submit', async (e) => {
//     e.preventDefault();
//     const username = (document.getElementById('username') as HTMLInputElement).value;
//     const password = (document.getElementById('password') as HTMLInputElement).value;

//     const res = await fetch('/api/login', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ username, password }),
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       error.textContent = data.message || 'Login failed';
//       error.classList.remove('hidden');
//     } else {
//       alert('✅ Logged in!');
//       location.hash = '#/profile';
//     }
//   });

//   googleBtn.addEventListener('click', async () => {
//     // Replace with actual redirect or popup flow later
//     alert('🧪 Google login not implemented yet.');
//     // Optional: Redirect to OAuth endpoint
//     // location.href = '/api/auth/google'
//   });
// }
