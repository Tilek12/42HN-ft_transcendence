import { FastifyPluginAsync } from 'fastify';
import { hashPassword, verifyPassword } from '../../auth/utils';
import { loginSchema, logoutSchema, registerSchema, toggle_TFA_Schema } from '../../auth/schemas';
import type { JWTPayload } from '../../plugins/authtypes';

// import fs from 'fs';
// import sharp from 'sharp';
// import path from 'path';
import {
	findUserByUsername,
	findUserByEmail,
	createUser
} from '../../database/user';

import { updateProfileLogInState, createProfile } from '../../database/profile';

const authRoutes: FastifyPluginAsync = async (fastify : any) => {
	// Register
	fastify.post('/register', { schema: registerSchema }, async (req : any, res : any) => {
		const { username, email, password } = req.body as any;
		if (await findUserByUsername(username)) {
			return res.status(400).send({ message: 'Username already taken' });
		}

		if (await findUserByEmail(email)) {
			return res.status(400).send({ message: 'Email already registered' });
		}
		const hashed = await hashPassword(password);
		await createUser(username, email, hashed);
		//-----Thomas--------
		await createProfile(username);
		//---------------Ican create here a default blob--------------
		//------------I want to find the file-------------------------
		//------------make it a blob----------------------------------

		//-----Thomas--------
		res.send({ message: 'User registered successfully' });
	});

	// Login
	fastify.post('/login', { schema: loginSchema }, async (req : any, res : any) => {
		const { username, password } = req.body;
		const user = await findUserByUsername(username);
		// console.log(user);
		if (!user || !(await verifyPassword(password, user.password))) {
			return res.status(401).send({ message: 'Invalid credentials' });
		}
		await updateProfileLogInState(user.id, true);
		const token = fastify.jwt.sign({ id: user.id }, { expiresIn: '2h' });
		res.send({ token });
	});

	// Logout
	fastify.post('/logout', { schema: logoutSchema }, async (req : any, res : any) =>
	{
		await req.jwtVerify();
		const payload = req.user as JWTPayload;
		
		await updateProfileLogInState(payload.id, false);
		res.send({ message: 'Logged out successfully' });
	});
	//
	fastify.post('/toggle2fa', {schema: toggle_TFA_Schema}, async (req : any, res : any) => {
		// const user = await req.jwtVerify();
	});
}

export default authRoutes;
