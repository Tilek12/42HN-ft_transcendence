import type { FastifyPluginAsync } from 'fastify';
import { hashPassword, verifyPassword } from '../../auth/utils.js';
import { loginSchema, registerSchema } from '../../auth/schemas.js';
import {
	findUserByUsername,
	findUserByEmail,
	createUser
} from '../../database/user.js';

import { updateProfileLogInState, createProfile } from '../../database/profile.js';
import type { JwtPayload } from '../../../shared/types/JwtPayload.js';


const authRoutes: FastifyPluginAsync = async (fastify: any) => {
	fastify.get('/', async (req: any, res: any) => {
		res.sendFile('index.html');
	});
	// Register
	fastify.post('/register', { schema: registerSchema }, async (req: any, res: any) => {
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
		//-----Thomas--------
		res.send({ message: 'User registered successfully' });
	});

	// Login
	fastify.post('/login', { schema: loginSchema }, async (req: any, res: any) => {
		const { username, password } = req.body as any;
		const user = await findUserByUsername(username); //TODO usertype?? atm is any
		if (!user || !(await verifyPassword(password, user.password))) {
			return res.status(401).send({ message: 'Invalid credentials' });
		}
		await updateProfileLogInState(user.id, true);
		const Payload: JwtPayload = { userid: user.id }
		const token = fastify.jwt.sign(Payload, { expiresIn: '2h' });
		res.send({ token });
	});

	// Logout
	fastify.post('/logout', async (req: any, res: any) => {
		const user = await req.jwtVerify();
		await updateProfileLogInState(user.id, false);
		res.send({ message: 'Logged out successfully' });
	});


}

export default authRoutes;
