import { db } from './client';

export async function findUserByUsername(username: string) {
  return await db.get('SELECT * FROM users WHERE username = ?', username);
}

export async function findUserByEmail(email: string) {
  return await db.get('SELECT * FROM users WHERE email = ?', email);
}

export async function findUserById(id: string) {
  return await db.get('SELECT * FROM users WHERE id = ?', id);
}

export async function createUser(username: string, email: string, hashedPassword: string) {
  await db.run(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    username,
    email,
    hashedPassword
  );
}

export async function findUsernameById(id: string) {
  return await db.get('SELECT username FROM users WHERE id = ?', id);
}
