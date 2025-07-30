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
export async function parseProfiles(prof_id : number) : Promise<any[]>
{
	return await db.all(
		`SELECT
		  u.id,
		  u.username,
		  p.wins,
		  p.losses,
		  p.trophies,
		  p.image_path,
		  p.logged_in
		FROM users u
		JOIN profiles p ON u.id = p.id
		WHERE u.id != ?`, prof_id);
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
	  `UPDATE profiles SET image_path = ? WHERE id = ?`,
	  path_or_url,
	  id
	);
}
//-----Friends list-------------------------------------
export async function parseFriends(id: number)
{
	const rows : any = await db.all(
		`
			SELECT
			u.id, u.username, u.created_at,
			p.wins, p.losses, p.trophies, p.image_path, p.logged_in
			FROM friends f
			JOIN users u ON f.friend_id = u.id
			JOIN profiles p ON u.id = p.id
			WHERE f.user_id = ?
		`, id);
	return rows; 
}

export async function bidirectionalAddAFriend(id_user: number, id_of_invited_user: number)
{
	if (id_user !== id_of_invited_user)
	{
		await db.run( `INSERT OR IGNORE INTO friends (user_id, friend_id) VALUES (?, ?)`, [id_user, id_of_invited_user]);
		await db.run( `INSERT OR IGNORE INTO friends (user_id, friend_id) VALUES (?, ?)`, [id_of_invited_user, id_user]);
	}
}
export async function bidirectionalDeleteAFriend(id_user: number, id_of_invited_user: number)
{
	if (id_user !== id_of_invited_user)
	{
		await db.run( `DELETE FROM friends WHERE user_id = ? AND friend_id = ?`, [id_user, id_of_invited_user]);
		await db.run( `DELETE FROM friends WHERE user_id = ? AND friend_id = ?`, [id_of_invited_user, id_user]);
	}
}
