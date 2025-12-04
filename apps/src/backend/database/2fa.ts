import { db } from './client';

async function store2faKey(id: number, secret: string) {
	await db.run('UPDATE users SET tfa_secret = ? WHERE id = ?', [secret, id]);
	return;
};

async function delete2faKey(id: number) {
	await db.run('UPDATE users SET tfa_secret = ? WHERE id = ?', [null, id]);
	return;
};
async function update2faStatus(id: number, status: boolean) {
	return await db.run('UPDATE users SET tfa = ? WHERE id = ?', [status, id]);
}


export {store2faKey, delete2faKey , update2faStatus};