// import { disconnectPresenceSocket } from "../websocket/presence";
import type { JwtPayload } from "../../shared/types/JwtPayload.js";

export function saveToken(token: string) {
	sessionStorage.setItem('jwt', token);
}

export function getToken(): string | null {
	const token = sessionStorage.getItem('jwt');
	console.log("token: ", token);
	return token;
}

export function getTokenPayload(): JwtPayload | null {
	const token = getToken();
	if (!token)
		return null;
	let payloadBase64 = token.split('.')[1];
	if (payloadBase64)
		return JSON.parse(Buffer.from(payloadBase64, "base64").toString('utf-8'));
	return null;
}
export function clearToken() {
	sessionStorage.removeItem('jwt');
	// disconnectPresenceSocket();
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
