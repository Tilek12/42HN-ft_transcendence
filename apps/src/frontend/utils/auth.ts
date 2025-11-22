import { changeLoginButton } from '../pages/nav.js';
import { payload, User } from '../types.js'

let user: User | undefined;
let csrfToken: string | undefined;


export function getUser() {
	return user;
}
export function setUser(newUser: User) {
	user = newUser;
}
export function clearUser() {
	user = undefined
}

export function saveCsrfToken(token: string) {
	csrfToken = token;
}

export function getcsrfToken(): string | undefined {
	return csrfToken;
}

export function clearscrfToken() {
	csrfToken = undefined;
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
		return true;
	} catch (e: any) {
		return false;
	}
}
