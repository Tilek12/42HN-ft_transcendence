import { db } from './client';
import { findUserByUsername } from './user';
import fs from 'fs';
import sharp from 'sharp';
import path from 'path';

//----------functions for profiles data base-----------
export async function findProfileByUsername(username: string)
{
	return await db.get('SELECT * FROM profiles WHERE username = ?', username);
}


export async function findProfileById(id: number)
{
	return await db.get('SELECT * FROM profiles WHERE id = ?', id);
}


export async function createProfile(username: string)
{
	let user = await findUserByUsername(username);
	if (!user)
		return;
	await db.run(
		'INSERT INTO profiles (id, wins, losses, trophies) VALUES (?,?,?,?)',
		user.id, 0, 0, 0
	);
	//-----------

}


export async function parseProfiles(prof_id : number, offset?: number, limit?: number) : Promise<any[]>
{
	let sqliteString = `SELECT
		  u.id,
		  u.username,
		  p.wins,
		  p.losses,
		  p.trophies,
		  p.image_blob
		FROM users u
		JOIN profiles p ON u.id = p.id
		WHERE u.id != ?`;
	if (offset !== undefined && limit !== undefined)
	{
		sqliteString += ` LIMIT  ? OFFSET ?`;
		return await db.all(sqliteString, [prof_id, limit, offset])
	}
	return await db.all(sqliteString, [prof_id]);

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

export async function updatePicture(id: number, image_blob?: any) {
	await db.run(
	  `UPDATE profiles SET image_blob = ? WHERE id = ?`,
	  image_blob,
	  id
	);
}


//-----Friends list-------------------------------------
export async function parseFriends(id: number, offset_param?: string, limit_param?: string)
{
	let rows : any;
	if (offset_param && limit_param)
	{
		rows = await db.all(
			`
				SELECT
				u.id, u.username, u.created_at,
				p.wins, p.losses, p.trophies, p.image_blob
				FROM friends f
				JOIN users u ON f.friend_id = u.id
				JOIN profiles p ON u.id = p.id
				WHERE f.user_id = ?
				LIMIT ? OFFSET ?
			`, [id, Number(limit_param), Number(offset_param)]);

	}
	else{
	rows = await db.all(
		`
			SELECT
			u.id, u.username, u.created_at,
			p.wins, p.losses, p.trophies, p.image_blob
			FROM friends f
			JOIN users u ON f.friend_id = u.id
			JOIN profiles p ON u.id = p.id
			WHERE f.user_id = ?
		`, id);
	}
	const row_with_stringified_image_blob = rows.map((row : any) => {if (row.image_blob) row.image_blob = row.image_blob.toString("base64"); return row;})
	return row_with_stringified_image_blob;
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

//-----------Blocked list-----------------------------------
export async function AddToBlockedList(id_user: number, id_of_blocked_user: number)
{
	const is_already_blocked = await userIsBlocked(id_user, id_of_blocked_user);
	if (id_user !== id_of_blocked_user && !is_already_blocked)
	{
		const friend_request_is_exists = await isExistsFriendRequest(id_user, id_of_blocked_user);
		if (friend_request_is_exists)
			await deleteFriendRequest(id_user, id_of_blocked_user);
		await db.run(`INSERT OR IGNORE INTO blocked_list (user_id, blocked_id) VALUES (?, ?)`, [id_user, id_of_blocked_user]);
	}
}


export async function userIsBlocked(user_id: number, profile_id: number) : Promise<any>
{
	let res : any;
	if (user_id !== profile_id)
		res = await db.get(`SELECT 1 FROM blocked_list WHERE (user_id = ? AND blocked_id = ?)`, [profile_id, user_id]);
	return !!res;
}


export async function DeleteFromBlockedList(id_user:number, id_of_blocked_user: number)
{
	if (id_user !== id_of_blocked_user)
			await db.run(`DELETE FROM blocked_list WHERE user_id = ? AND blocked_id =
		?`, [id_user, id_of_blocked_user])
}


export async function parseBlockedList(user_id: number) : Promise<any[]>
{
	return await db.all('SELECT user_id, blocked_id FROM blocked_list WHERE user_id = ?', user_id);
}


//-------Friend request List--------------------------------
export async function isExistsFriendRequest(senderId : number, recieverId: number)
{
	return await db.get(
		`SELECT 1 FROM friends_requests WHERE (sender_id = ? AND receiver_id = ?)`, [senderId, recieverId]
	)
}




export async function addFriendRequest(senderId: number, receiverId: number)
{

	const existing= await (isExistsFriendRequest(senderId, receiverId) || isExistsFriendRequest(receiverId,senderId));
	if ((senderId ===  receiverId) || existing)
		return ;
	await db.run(`INSERT OR IGNORE INTO friends_requests (sender_id, receiver_id) VALUES (?, ?)`, [senderId, receiverId]);
}


export async function deleteFriendRequest(senderId: number, receiverId: number)
{
	if (senderId ===  receiverId)
		return ;
	await db.run(`DELETE FROM friends_requests WHERE sender_id = ?  AND receiver_id = ?`, [senderId, receiverId]);
}


export async function parsePendingRequests(userId: number, offset_param?: string, limit_param?: string ) : Promise<any[]>
{
	let res : any;
	if (offset_param && limit_param)
		res =  await db.all(`SELECT sender_id, receiver_id sent_at FROM friends_requests WHERE receiver_id = ? LIMIT ? OFFSET ?`,[userId, parseInt(offset_param), parseInt(limit_param)]);
	res =  await db.all(`SELECT sender_id, receiver_id sent_at FROM friends_requests WHERE receiver_id = ?`,[userId]);
	return res;
}


export async function parseBidirectionalPendingRequests(userId: number, profileId: number) : Promise<any[]>
{
	return await db.all(`SELECT sender_id, receiver_id FROM friends_requests WHERE sender_id = ? OR receiver_id = ?`,[userId, profileId]);
}
