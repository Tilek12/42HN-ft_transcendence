import {payload} from '../types.js'

let jwtToken: string | undefined;
let Payload: payload | undefined;

export function saveToken(token: string) {
	jwtToken = token;
}

export function getToken(): string | undefined {
	return jwtToken;
}

export function clearToken() {
	jwtToken = undefined;
}

export function enabled_2fa():boolean {
	const payload = getJWTPayload();
	if (payload)
	{
		return payload.tfa;
	}
	return false;
}

export function getJWTPayload(): payload | undefined {

	if (jwtToken){
		if (!Payload)
		{

			const arr = jwtToken.split('.');
			if (arr[1])
				Payload =  JSON.parse(atob(arr[1]));
		}
		return Payload;
	}
	return undefined;
}


export async function validateLogin(): Promise<boolean> {

	if (!jwtToken) return false;
	try {
	  const res = await fetch('/api/private/me', {
		headers: { Authorization: `Bearer ${jwtToken}` },
	  });
	  if (!res.ok) throw new Error();
	  return true;
	} catch (e:any){
	  return false;
	}
}
