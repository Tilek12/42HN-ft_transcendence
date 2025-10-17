import { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { hashPassword, verifyPassword } from '../../auth/utils';
import { loginSchema, logoutSchema, registerSchema, toggle_TFA_Schema} from '../../auth/schemas';
import type { JWTPayload } from '../../plugins/authtypes';

import {
	findUserByUsername,
	findUserByEmail,
	createUser
} from '../../database/user';

import { updateProfileLogInState, createProfile } from '../../database/profile';
import { generateqrcode, generateSecret } from '../../2FA/2fa';
import { store2faKey } from '../../database/2fa';

const authRoutes: FastifyPluginAsync = async (fastify : FastifyInstance) => {
	// Register
	fastify.post('/register', { schema: registerSchema }, async (req : any, res : any) => {
		const { username, email, password, tfa } = req.body as any;
		if (await findUserByUsername(username)) {
			return res.status(400).send({ message: 'Username already taken' });
		}

		if (await findUserByEmail(email)) {
			return res.status(400).send({ message: 'Email already registered' });
		}
		const hashed = await hashPassword(password);

		let user = await createUser(username, email, hashed, tfa);
		console.log(user);
		await createProfile(username);

		if (tfa)
		{
			const secret = generateSecret();
			const qrcode = await generateqrcode(secret);
			res.status(200).send({ message: 'registered successfully' , qr: qrcode});
		}
		else
			res.status(200).send({ message: 'registered successfully' });

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
}

export default authRoutes;
