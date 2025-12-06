import { db } from './client';
import { User } from '../backendTypes'


async function findUserByUsername(username: string): Promise<User | null> {
	
	const ret = await db.get('SELECT * FROM users WHERE username = ?', username);
	if (!ret)
		return null;
	return ret as User;
}


async function findUserById(id: number): Promise<User | null> {
	const ret = await db.get('SELECT * FROM users WHERE id = ?', id);
	if (!ret)
		return null;
	return ret as User;
}

async function createUser(username: string, hashedPassword: string, tfa:boolean) {
	return await db.run(
		'INSERT INTO users (username, password, tfa, role) VALUES (?, ?, ?, ?)',
		username,
		hashedPassword,
		tfa,
		"user"
	);
}

async function deleteUser(id:number)
{
	await db.run('DELETE FROM users WHERE id = ?', [id]);
	await db.run('DELETE FROM profiles WHERE id = ?', [id]);
	
}

async function log_in(id:  number, token: string) {
	return await db.run('UPDATE users SET is_logged_in = ? WHERE id = ?', [token, id]);
}
async function log_out(id:  number) {
	return await db.run('UPDATE users SET is_logged_in = ? WHERE id = ?', [null, id]);
}

async function get_login_token(id: number)
{
	return await db.run('SELECT is_logged_in FROM users WHERE id = ?', [id]);

} 

async function logout_all_users() {
	return await db.run('UPDATE users SET is_logged_in = NULL')
}

async function isUsername(new_username: string) {
	const result = await db.get('SELECT id FROM users WHERE username = ? ', new_username);
	return result !== undefined ? true : false;
}

async function updateUsername(id: number, new_username: string) {
	return await db.run('UPDATE users SET username = ? WHERE id = ?', [new_username, id]);
}

async function updatePasswordById(id: number, new_password: string) {
	return await db.run('UPDATE users SET password = ? WHERE id = ?', [new_password, id]);
}

async function getUsernameById(id: number): Promise<string | null> {
	const row = await db.get<{ username: string }>('SELECT username FROM users WHERE id = ?', id);
	return row?.username || null;
}

export { findUserByUsername, findUserById, createUser, deleteUser, log_in, log_out, get_login_token, logout_all_users, isUsername, updateUsername, updatePasswordById, getUsernameById };