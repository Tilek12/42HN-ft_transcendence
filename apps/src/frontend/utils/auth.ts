import { changeLoginButton } from '../pages/nav.js';
import { payload, User } from '../types.js'

let user: User | null;
let csrfToken: string | null;

export function getUser():User | null {
	return user;
}
export function setUser(newUser: User|null) {
	user = newUser;
}
export function clearUser() {
	user = null
}

export function saveCsrfToken(token: string) {
	csrfToken = token;
}

export function getcsrfToken(): string | null {
	return csrfToken;
}

export function clearscrfToken() {
	csrfToken = null;
}

export async function validateLogin(): Promise<boolean> {

	try {
		const res = await fetch('/api/private/me', {
			method: "GET",
			credentials: "include",
		});
		if (!res.ok)
			throw new Error();
		changeLoginButton(false);
		const data = await res.json();
		if (data.user)
			setUser(data.user);
		return true;
	} catch (e: any) {
		return false;
	}
}
