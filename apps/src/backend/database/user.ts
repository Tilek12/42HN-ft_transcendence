import { db } from './client';

export type User = {
  id: number, 
  username: string,
  email:string,
  password: string,
  role: string,
  is_logged_in: boolean,
  tfa: boolean,
  tfa_secret:string,
}


async function findUserByUsername(username: string): Promise<User | null> {
	
	const ret = await db.get('SELECT * FROM users WHERE username = ?', username);
	if (!ret)
		return null;
	return ret as User;
}

async function findUserByEmail(email: string): Promise<User | null> {
	const ret = await db.get('SELECT * FROM users WHERE email = ?', email);
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

async function createUser(username: string, email: string, hashedPassword: string, tfa:boolean) {
	return await db.run(
		'INSERT INTO users (username, email, password, tfa, role) VALUES (?, ?, ?, ?, ?)',
		username,
		email,
		hashedPassword,
		tfa,
		"user"
	);
}
async function isUsername(new_username: string) {
	const result = await db.get('SELECT id FROM users WHERE username = ? ', new_username);
	// console.log(`result ------->>> ${result}`)
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

export { findUserByUsername, findUserById, findUserByEmail, createUser, isUsername, updateUsername, updatePasswordById, getUsernameById };