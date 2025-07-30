import { connectToDB } from './client';

export async function initDatabase() {
  const db = await connectToDB();
}
