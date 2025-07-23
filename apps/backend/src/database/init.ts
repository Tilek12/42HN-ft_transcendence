import { connectToDB } from './client';

export async function initDatabase() {
  const db = await connectToDB();
//---------- commented by thomas --------------
//   await db.exec(`
//     CREATE TABLE IF NOT EXISTS users (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       username TEXT UNIQUE NOT NULL,
//       email TEXT UNIQUE NOT NULL,
//       password TEXT NOT NULL,
//       created_at TEXT DEFAULT CURRENT_TIMESTAMP
//     );
//   `);
//---------- commented by thomas --------------
}
