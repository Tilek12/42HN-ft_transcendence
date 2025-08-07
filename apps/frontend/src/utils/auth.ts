// import { disconnectPresenceSocket } from "../websocket/presence";

export function saveToken(token: string) {
	sessionStorage.setItem('jwt', token);
}

export function getToken(): string | null {
	return sessionStorage.getItem('jwt');
}

export function clearToken() {
	sessionStorage.removeItem('jwt');
	// disconnectPresenceSocket();
}

export function isLoggedIn(): boolean {
	// TEMPORARILY DISABLED: Always return true to bypass authentication
	return true;
	
	/* ORIGINAL CODE - COMMENTED OUT FOR TESTING
	return !!getToken();
	*/
}

export async function validateLogin(): Promise<boolean> {
	// TEMPORARILY DISABLED: Always return true to bypass authentication
	return true;
	
	/* ORIGINAL CODE - COMMENTED OUT FOR TESTING
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
	*/
}
