import { disconnectPresenceSocket } from "../websocket/presence";
export function saveToken(token) {
    sessionStorage.setItem('jwt', token);
}
export function getToken() {
    return sessionStorage.getItem('jwt');
}
export function clearToken() {
    sessionStorage.removeItem('jwt');
    disconnectPresenceSocket();
}
export function isLoggedIn() {
    return !!getToken();
}
export async function validateLogin() {
    const token = getToken();
    if (!token)
        return false;
    try {
        const res = await fetch('/api/private/me', {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok)
            throw new Error();
        return true;
    }
    catch {
        clearToken();
        return false;
    }
}
