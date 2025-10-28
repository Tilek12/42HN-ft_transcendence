import { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { hashPassword, verifyPassword } from '../../auth/utils';
import { LoginBody, loginSchema, logoutSchema, registerBody, registerSchema } from '../../auth/schemas';
import type { JWTPayload } from '../../types';
import { Jwt_type } from '../../types';
import {
	findUserByUsername,
	findUserByEmail,
	createUser
} from '../../database/user';

import { updateProfileLogInState, createProfile } from '../../database/profile';

const authRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
	// Register
	fastify.post<{ Body: registerBody }>('/register', { schema: registerSchema }, async (req, res) => {
		const { username, email, password, tfa } = req.body;
		if (await findUserByUsername(username)) {
			return res.status(400).send({ message: 'USERNAME_TAKEN' });
		}

		if (await findUserByEmail(email)) {
			return res.status(400).send({ message: 'EMAIL_TAKEN' });
		}
		const hashed = await hashPassword(password);

		await createUser(username, email, hashed, tfa ? true : false);
		const user = await findUserByUsername(username);
		await createProfile(username);
		if (!user)
			return res.status(500).send({ message: "database error" });
		let payload: JWTPayload = { id: user.id, username: user.username, tfa: user.tfa, role: user.role, type: Jwt_type.normal };
		let token: string;
		if (user.tfa) {
			payload.type = Jwt_type.tmp;
			token = fastify.jwt.sign(payload, { expiresIn: '10min' });
		}
		else
		{
			await updateProfileLogInState(user.id, true);
			token = fastify.jwt.sign(payload, { expiresIn: '2h' });
		}
		res.send({ jwt: token });
	});

	// Login
	fastify.post<{ Body: LoginBody }>('/login', { schema: loginSchema }, async (req, res) => {
		const { username, password } = req.body;
		const user = await findUserByUsername(username);
		// console.log(user);
		if (!user || !(await verifyPassword(password, user.password)) || user.username !== username) {
			return res.status(401).send({ message: 'Invalid credentials' });
		}
		if (user.username !== username) {
			return res.status(401).send({ message: 'Invalid username' });
		}
		if (!(await verifyPassword(password, user.password))) {
			return res.status(401).send({ message: 'Invalid password' });
		}

		let payload: JWTPayload = { id: user.id, username: user.username, tfa: user.tfa, role: user.role, type: Jwt_type.normal };
		let token: string;
		if (user.tfa) {
			payload.type = Jwt_type.tmp;
			token = fastify.jwt.sign(payload, { expiresIn: '10min' });
		}
		else {
			await updateProfileLogInState(user.id, true);
			token = fastify.jwt.sign(payload, { expiresIn: '2h' });
		}
		res.send({ jwt: token });
	});

	// Logout
	fastify.post('/logout', { schema: logoutSchema, }, async (req: any, res: any) => {
		try {
			await req.jwtVerify()
		} catch (err) {
			res.status(401).send({ message: "Unauthorized"});
		}
		const payload = req.user as JWTPayload;

		await updateProfileLogInState(payload.id, false);
		res.send({ message: 'Logged out successfully' });
	});
}

export default authRoutes;
