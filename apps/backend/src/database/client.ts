import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

export let db: Database;

export async function connectToDB() {
  db = await open({
    filename: './data/database.db',
    driver: sqlite3.Database,
  });
}

//SEQUELIZE - ORM
//Prisma - ORM
