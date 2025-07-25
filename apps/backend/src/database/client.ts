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
	  path_or_url_to_image TEXT,
	  logged_in BOOLEAN DEFAULT FALSE,
	  wins INTEGER DEFAULT 0,
	  losses INTEGER DEFAULT 0,
	  trophies INTEGER DEFAULT 0,
      FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player1_id INTEGER NOT NULL,
      player2_id INTEGER NOT NULL,
      player1_score INTEGER NOT NULL,
      player2_score INTEGER NOT NULL,
      winner_id INTEGER,
      is_tie BOOLEAN DEFAULT 0,
      is_tournament_match BOOLEAN DEFAULT 0,
      played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(player1_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(player2_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(winner_id) REFERENCES users(id)
    );
  `);
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_by_user_id INTEGER NOT NULL,
      status TEXT CHECK(status IN ('waiting', 'ongoing', 'completed')) DEFAULT 'waiting',
      start_time DATETIME,
      end_time DATETIME,
      FOREIGN KEY(created_by_user_id) REFERENCES users(id)
    );
  `);
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tournament_participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      FOREIGN KEY(tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(tournament_id, user_id)
    );
  `);
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tournament_matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      match_id INTEGER NOT NULL,
      FOREIGN KEY(tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
      FOREIGN KEY(match_id) REFERENCES matches(id) ON DELETE CASCADE
    );
  `);
  
}

//SEQUELIZE - ORM
//Prisma - ORM
//SELECT profiles.* user.username, users.email, users.created_at
//FROM profile
//JOIN users ON profiles.id =users.id
//where profiles.id = ?
//, userId