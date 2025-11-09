import {payload} from '../pages/types'

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

export function enabled_2fa():boolean {
	const payload = getJWTPayload();
	if (payload)
	{
		return payload.tfa;
	}
	return false;
}

export function getJWTPayload(): payload | null {

	const token = getToken();
	if (token){
		const arr = token.split('.');
		if (arr[1])
			return JSON.parse(atob(arr[1])) as payload;
	}
	return null;
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
	} catch (e:any){
	  	clearToken();
	  return false;
	}
}
