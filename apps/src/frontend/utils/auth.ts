import { renderConnectionErrorPage } from '../pages/error.js';
import { changeLoginButton } from '../pages/nav.js';
import { payload, User } from '../types.js'

let user: User | null;
let csrfToken: string | null;

export function getUser(): User | null {
	return user;
}
export function setUser(newUser: User | null) {
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
		const res = await apiFetch('/api/private/me', {
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



export async function apiFetch(url: RequestInfo, options: RequestInit): Promise<Response> {
		let responsePromise = fetch(url, options);
		const response = await responsePromise;
		if (response.status === 401) {
			const refresh = await fetch('/api/refresh', {
				method: 'POST',
				credentials: 'include',
			})
			if (refresh.status === 200)
				return fetch(url, options);
		}
		return responsePromise;

}