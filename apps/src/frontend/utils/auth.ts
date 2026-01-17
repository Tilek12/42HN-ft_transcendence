import { renderConnectionErrorPage } from '../pages/error.js';
import { changeLoginButton, logoutFrontend } from '../pages/nav.js';
import { payload, fUser } from '../frontendTypes.js'


let user: fUser | null = null;
let csrfToken: string | null;

export function getUser(): fUser | null {
	return user;
}

export function setUser(newUser: fUser | null) {
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


export async function fetchUser() {
	try {
		const res = await apiFetch('/api/private/profile', {
			method: 'GET',
			credentials: 'include',
		});
		if (res.ok) {
			const data = await res.json();
			const { username, image_blob, wins, losses, trophies } = data;
			if (!user)
				if (!validateLogin())
					throw new Error("INVALID LOGIN")
			if (user) {
				user.username = username;
				user.image_blob = image_blob !== null ? image_blob : undefined;
				user.wins = wins;
				user.losses = losses;
				user.trophies = trophies;
			}
			else
				throw new Error("NO USER OBJECT")
		}
	} catch (err: any) {
		renderConnectionErrorPage(err.message);
	}
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
		if (data.user) {
			if (!user) {
				user = data.user;
			}
			else {
				user.tfa = data.user.tfa;
				user.id = data.user.id;
				user.username = data.user.username;
			}
		}
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
		else {
			logoutFrontend();
		}
	}
	return responsePromise;



}


export function isValidUsername(username:string)
{
	const regex: RegExp = /[a-zA-Z0-9].{3,30}$/;
	if (regex.test(username))
		return true;
	return false;
}

export function isValidPassword(password:string)
{
	const regex: RegExp = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-])[A-Za-z0-9#?!@$%^&*-]{8,64}$/;
	if (regex.test(password))
		return true;
	return false;
}
export function isValidToken(token:string)
{
	const regex: RegExp = /^\d{6}$/;
	if (regex.test(token))
		return true;
	return false;
}