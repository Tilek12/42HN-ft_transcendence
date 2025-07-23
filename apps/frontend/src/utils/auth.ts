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

export async function validateLogin(): Promise<boolean> {
	const token = getToken();
	if (!token) return false;
	try {
	  const res = await fetch('/api/private/me', {
		headers: { Authorization: `Bearer ${token}` },
	  });
	  if (!res.ok) throw new Error();
	  return true;
	} catch {
	  clearToken();
	  return false;
	}
}
