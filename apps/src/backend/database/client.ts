import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

export let db: Database;

export async function connectToDB() {
  db = await open({
    filename: './database/pong.db',
    driver: sqlite3.Database,
  });
 //---------------users table------------------
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      is_logged_in BOOLEAN DEFAULT FALSE,
      role TEXT NOT NULL CHECK(role IN ('admin', 'user')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      tfa BOOLEAN DEFAULT FALSE,
      tfa_secret TEXT
    );
  `);
  //--------------profile table-----------------
  await db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY, -- same as user.id
	  image_blob BLOB,
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
  
  //------------blocked_users_table--------------
  await db.exec (
	`
	 CREATE TABLE IF NOT EXISTS blocked_list 
	 (
	   user_id INTEGER NOT NULL,
	   blocked_id INTEGER NOT NULL,
	   PRIMARY KEY (user_id, blocked_id),
	   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
	   FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE
	 )
	`);
  //-------------friends table-------------------
  await db.exec (
	`
	 CREATE TABLE IF NOT EXISTS friends 
	 (
	   user_id INTEGER NOT_NULL,
	   friend_id INTEGER NOT_NULL,
	   PRIMARY KEY (user_id, friend_id),
	   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
	   FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
	 )
	`);

 //------------friends request table----------------
 await db.exec (
	`
		CREATE TABLE IF NOT EXISTS friends_requests (
			sender_id INTEGER NOT NULL,
			receiver_id INTEGER NOT NULL,
			sent_at DATATIME DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (sender_id, receiver_id),
			FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
		)
	`
 );
}
