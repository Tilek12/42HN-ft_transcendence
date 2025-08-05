"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByUsername = findUserByUsername;
exports.findUserByEmail = findUserByEmail;
exports.findUserById = findUserById;
exports.createUser = createUser;
exports.getUsernameById = getUsernameById;
const client_1 = require("./client");
async function findUserByUsername(username) {
    return await client_1.db.get('SELECT * FROM users WHERE username = ?', username);
}
async function findUserByEmail(email) {
    return await client_1.db.get('SELECT * FROM users WHERE email = ?', email);
}
async function findUserById(id) {
    return await client_1.db.get('SELECT * FROM users WHERE id = ?', id);
}
async function createUser(username, email, hashedPassword) {
    await client_1.db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', username, email, hashedPassword);
}
async function getUsernameById(id) {
    const row = await client_1.db.get('SELECT username FROM users WHERE id = ?', id);
    return row?.username || null;
}
//# sourceMappingURL=user.js.map