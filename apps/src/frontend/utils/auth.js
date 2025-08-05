"use strict";
// import { disconnectPresenceSocket } from "../websocket/presence";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveToken = saveToken;
exports.getToken = getToken;
exports.clearToken = clearToken;
exports.isLoggedIn = isLoggedIn;
exports.validateLogin = validateLogin;
function saveToken(token) {
    sessionStorage.setItem('jwt', token);
}
function getToken() {
    return sessionStorage.getItem('jwt');
}
function clearToken() {
    sessionStorage.removeItem('jwt');
    // disconnectPresenceSocket();
}
function isLoggedIn() {
    return !!getToken();
}
async function validateLogin() {
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
//# sourceMappingURL=auth.js.map