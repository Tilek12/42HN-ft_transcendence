import { connectToDB } from './client.js';

export async function initDatabase() {
	await connectToDB();
}
