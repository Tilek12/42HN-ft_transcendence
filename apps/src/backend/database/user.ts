import { db } from './client';

async function findUserByUsername(username: string) {
	return await db.get('SELECT * FROM users WHERE username = ?', username);
}

async function findUserByEmail(email: string) {
	return await db.get('SELECT * FROM users WHERE email = ?', email);
}

async function findUserById(id: string) {
	return await db.get('SELECT * FROM users WHERE id = ?', id);
}

async function createUser(username: string, email: string, hashedPassword: string) {
	await db.run(
		'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
		username,
		email,
		hashedPassword
	);
}
async function isUsername(new_username : string)
{
	const result = await db.get('SELECT id FROM users WHERE username = ? ', new_username);
	console.log(`result ------->>> ${result}`)
	return result !== undefined ? true : false;
}
async function updateUsername (id: number, new_username: string)
{
	return await db.run('UPDATE users SET username = ? WHERE id = ?', [new_username, id]);
}
async function updatePasswordById(id : number, new_password: string)
{
	return await db.run('UPDATE users SET password = ? WHERE id = ?', [new_password, id]);
}

async function getUsernameById(id: string): Promise<string | null> {
	const row = await db.get<{ username: string }>('SELECT username FROM users WHERE id = ?', id);
	return row?.username || null;
}

export {findUserByUsername, findUserById, findUserByEmail, createUser, isUsername, updateUsername, updatePasswordById, getUsernameById};