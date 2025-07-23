import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

export let db: Database;

export async function connectToDB() {
  db = await open({
    filename: './database/pong.db',
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY, -- same as user.id
	  logged_in BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (id) REFERENCES users(id)
    );
  `);
}

//SEQUELIZE - ORM
//Prisma - ORM
