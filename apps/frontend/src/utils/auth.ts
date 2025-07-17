export function saveToken(token: string) {
	sessionStorage.setItem('jwt', token);
}

export function getToken(): string | null {
	return sessionStorage.getItem('jwt');
}

export function clearToken() {
	sessionStorage.removeItem('jwt');
}

export function isLoggedIn(): boolean {
	return !!getToken();
}
