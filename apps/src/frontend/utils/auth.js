"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = getUser;
exports.setUser = setUser;
exports.clearUser = clearUser;
exports.saveCsrfToken = saveCsrfToken;
exports.getcsrfToken = getcsrfToken;
exports.clearscrfToken = clearscrfToken;
exports.validateLogin = validateLogin;
exports.apiFetch = apiFetch;
const nav_js_1 = require("../pages/nav.js");
let user;
let csrfToken;
function getUser() {
    return user;
}
function setUser(newUser) {
    user = newUser;
}
function clearUser() {
    user = null;
}
function saveCsrfToken(token) {
    csrfToken = token;
}
function getcsrfToken() {
    return csrfToken;
}
function clearscrfToken() {
    csrfToken = null;
}
async function validateLogin() {
    try {
        const res = await apiFetch('/api/private/me', {
            method: "GET",
            credentials: "include",
        });
        if (!res.ok)
            throw new Error();
        (0, nav_js_1.changeLoginButton)(false);
        const data = await res.json();
        if (data.user)
            setUser(data.user);
        return true;
    }
    catch (e) {
        return false;
    }
}
async function apiFetch(url, options) {
    let responsePromise = fetch(url, options);
    const response = await responsePromise;
    if (response.status === 401) {
        const refresh = await fetch('/api/refresh', {
            method: 'POST',
            credentials: 'include',
        });
        if (refresh.status === 200)
            return fetch(url, options);
        else {
            (0, nav_js_1.logoutFrontend)();
        }
    }
    return responsePromise;
}
