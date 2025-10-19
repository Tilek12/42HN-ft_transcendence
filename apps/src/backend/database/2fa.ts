import { db } from './client';

async function store2faKey(id: number, secret: string) {
	await db.run('UPDATE users SET tfa_secret = ? WHERE id = ?', [secret, id]);
	await db.run('UPDATE users SET tfa = ? WHERE id = ?', [true, id]);
	return;
};

async function delete2faKey(id: number) {
	await db.run('UPDATE users SET tfa_secret = ? WHERE id = ?', ["", id]);
	await db.run('UPDATE users SET tfa = ? WHERE id = ?', [false, id]);
	return;
};

export {store2faKey, delete2faKey };