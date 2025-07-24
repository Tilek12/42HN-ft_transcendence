import { db } from './client';
//----------functions for users data base-----------
export async function findUserByUsername(username: string) {
  return await db.get('SELECT * FROM users WHERE username = ?', username);
}

export async function findUserByEmail(email: string) {
  return await db.get('SELECT * FROM users WHERE email = ?', email);
}

export async function findUserById(id: number) {
  return await db.get('SELECT * FROM users WHERE id = ?', id);
}

export async function createUser(username: string, email: string, hashedPassword: string) {
  await db.run(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    username,
    email,
    hashedPassword
  );
}
//----------functions for profiles data base-----------
export async function findProfileByUsername(username:string)
{
	return await db.get('SELECT * FROM profiles WHERE username = ?', username);
}

export async function findProfileByEmail(email: string)
{
	return await db.get('SELECT * FROM profiles WHERE email = ?', email);
}

export async function findProfileById(id:  number)
{
	return await db.get('SELECT * FROM profiles WHERE id = ?', id);
}

export async function createProfile(username: string)
{
	let user = await findUserByUsername(username);
	await db.run(
		'INSERT INTO profiles (id, logged_in, wins, losses, trophies) VALUES (?,?,?,?,?)',
		user.id, false, 0, 0, 0
	);
}
export async function updateProfileLogInState(id: number, status: boolean)
{
	await db.run(
		'UPDATE profiles SET logged_in = ? WHERE id = ?',
		status,
		id
	);
}
//-----Matches and tournaments-------------------------
export async function incrementWinsOrLossesOrTrophies(id: number, field: 'wins' | 'losses' | 'trophies')
{
	await db.run(
		`UPDATE profiles SET ${field} = ${field} + 1 WHERE id = ?`,
		id
	);
//-----Profile path or url-----------------------------
}

export async function updatePicturePath(id: number, path_or_url: string) {
	await db.run(
	  `UPDATE profiles SET path_or_url_to_image = ? WHERE id = ?`,
	  path_or_url,
	  id
	);
  }
