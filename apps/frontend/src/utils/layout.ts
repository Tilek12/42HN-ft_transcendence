export function renderBackgroundFull(content: string): string {
	return `
	  <div class="fixed inset-0 bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
		<!-- Animated background elements -->
		<div class="fixed inset-0 opacity-20 pointer-events-none">
		  <div class="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
		  <div class="absolute top-60 right-10 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
		  <div class="absolute bottom-32 left-1/2 w-72 h-72 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
		</div>

		<div class="flex items-center justify-center h-full p-4">
		  ${content}
		</div>
	  </div>
	`;
}

export function renderBackgroundTop(content: string): string {
	return `
	  <div class="fixed inset-0 bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
		<!-- Animated background elements -->
		<div class="fixed inset-0 opacity-20 pointer-events-none">
		  <div class="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
		  <div class="absolute top-60 right-10 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
		  <div class="absolute bottom-32 left-1/2 w-72 h-72 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
		</div>

		<div class="justify-center h-full p-4">
		  ${content}
		</div>
	  </div>
	`;
  }
