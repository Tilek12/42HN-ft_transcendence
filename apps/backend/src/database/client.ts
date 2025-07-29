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
	  image_path TEXT,
	  logged_in BOOLEAN DEFAULT FALSE,
	  wins INTEGER DEFAULT 0,
	  losses INTEGER DEFAULT 0,
	  trophies INTEGER DEFAULT 0,
      FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  await db.exec(
	`CREATE TABLE IF NOT EXISTS friends
	(
		user_id INTEGER NOT NULL,
		friend_id INTEGER NOT NULL,
		PRIMARY KEY (user_id, friend_id),
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
		FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
	)`
	);
}

//SEQUELIZE - ORM
//Prisma - ORM
//SELECT profiles.* user.username, users.email, users.created_at
//FROM profile
//JOIN users ON profiles.id =users.id
//where profiles.id = ?
//, userId