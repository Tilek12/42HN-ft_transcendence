import { FastifyPluginAsync } from 'fastify';
import { hashPassword, verifyPassword } from '../../auth/utils';
import { loginSchema, registerSchema } from '../../auth/schemas';
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
		//-----Thomas--------
		res.send({ message: 'User registered successfully' });
	});

	// Login
	fastify.post('/login', { schema: loginSchema }, async (req : any, res : any) => {
		const { username, password } = req.body as any;
		const user = await findUserByUsername(username);
		if (!user || !(await verifyPassword(password, user.password))) {
			return res.status(401).send({ message: 'Invalid credentials' });
		}
		await updateProfileLogInState(user.id, true);
		const token = fastify.jwt.sign({ id: user.id }, { expiresIn: '2h' });
		res.send({ token });
	});

	// Logout
	fastify.post('/logout', async (req : any, res : any) =>
	{
		const user = await req.jwtVerify();
		await updateProfileLogInState(user.id, false);
		res.send({ message: 'Logged out successfully' });
	});
};

export default authRoutes;
