import { FastifyInstance, FastifyPluginAsync, FastifyReply } from 'fastify';
import { hashPassword, verifyPassword } from '../../auth/utils';
import { LoginBody, loginSchema, logoutSchema, refreshSchema, registerBody, registerSchema } from '../../auth/schemas';
import type { JWTPayload, User } from '../../backendTypes';
import { Jwt_type } from '../../backendTypes';
import { findUserByUsername, createUser, log_in, log_out, findUserById, deleteUser } from '../../database/user';
import { createProfile } from '../../database/profile';
import { userManager } from '../../service-managers/user-manager';
import { setRefreshCookie, setAccessCookie, deleteAccessCookie, deleteRefreshCookie } from '../../auth/cookies'






const authRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {


	function generateToken(user: User, type: Jwt_type, expires: string): string {
		let payload: JWTPayload = {
			id: user.id,
			username: user.username,
			tfa: user.tfa,
			role: user.role,
			type: type
		};
		return fastify.jwt.sign(payload, { expiresIn: expires });
	}

	// Register
	fastify.post<{ Body: registerBody }>
		('/register',
			{ schema: registerSchema },
			async (req, res) => {
				const { username, password, tfa } = req.body;
				if (await findUserByUsername(username)) {
					return res.status(400).send({ message: 'USERNAME_TAKEN' });
				}
				const hashed = await hashPassword(password);

				await createUser(username, hashed, false);
				const user = await findUserByUsername(username);
				await createProfile(username);
				if (!user)
					return res.status(500).send({ message: "DATABASE_ERROR" });
				let token: string;
				if (tfa) {
					token = generateToken(user, Jwt_type.enable, '5min');
					
					res.status(200).send({ enablejwt:token, tfa: true });
				}
				else {
					token = generateToken(user, Jwt_type.refresh, '1week');
					setAccessCookie(generateToken(user, Jwt_type.access, '5min'), res);
					setRefreshCookie(token, res);
					await log_in(user.id, token);
					return res.status(200).send({ tfa: false });
				}
				setTimeout(async() => {
					if (user.tfa)
					{
						const test = await findUserById(user.id);
						fastify.log.warn('[ REGISTER ] DELETING USER: registered 2fa but didnt validate in time')
						if (test && !test.is_logged_in)
							deleteUser(user.id);
					}
					
				}, 300000);
			});

	// Login
	fastify.post<{ Body: LoginBody }>
		('/login',
			{ schema: loginSchema },
			async (req, res) => {
				const { username, password } = req.body;
				const user = await findUserByUsername(username);
				if (!user || !(await verifyPassword(password, user.password)) || user.username !== username)
					return res.status(401).send({ message: 'Invalid credentials' });

				if (user.username !== username)
					return res.status(401).send({ message: 'Invalid username' });

				if (!(await verifyPassword(password, user.password)))
					return res.status(401).send({ message: 'Invalid password' });

				if (user && userManager.getUser(user.id))
					return res.status(410).send({ message: 'User already logged in' })

				let token: string;
				if (user.tfa) {
					token = generateToken(user, Jwt_type.verify, '5min');
					res.status(200).send({ verifyjwt: token, tfa: true });
				}
				else {
					token = generateToken(user, Jwt_type.refresh, '1week');
					setAccessCookie(generateToken(user, Jwt_type.access, '5min'), res);
					setRefreshCookie(token, res);
					await log_in(user.id, token);
					return res.status(200).send({ tfa: false });
				}
			});

	// Logout
	fastify.post('/logout',
		{ schema: logoutSchema, },
		async (req: any, res: any) => {
			try {
				await req.jwtVerify()
			} catch (err) {
				res.status(401).send({ message: "Unauthorized" });
			}
			const payload = req.user as JWTPayload;

			await log_out(payload.id);
			userManager.removeUser(payload.id);
			deleteAccessCookie(res);
			deleteRefreshCookie(res);
			res.send({ message: 'Logged out successfully' });
		});


	fastify.post('/refresh',
		{ schema: refreshSchema },
		async (req, res) => {
		let user: User | null;
		let refeshCookie: string|null;
		try {
			const signedRefreshCookie = req.cookies['REFRESH'];
			if (!signedRefreshCookie)
				throw new Error('No Cookie provided!');
			else
			{
				const unsignedCookie = req.unsignCookie(signedRefreshCookie);
				if (!unsignedCookie.valid || !unsignedCookie.value)
					throw new Error('Cookie unsign error');
				else
					refeshCookie = unsignedCookie.value;
			}
			const payload = await fastify.jwt.verify(refeshCookie) as JWTPayload;
			if (payload.type !== Jwt_type.refresh)
				throw new Error('Invalid token type!');
			user = await findUserById(payload.id)
			if (!user || !user.is_logged_in)
				throw new Error('User not Logged in');

			if (refeshCookie !== user.is_logged_in)
			{
				throw new Error('Not the same refresh token!');
			}
		}
		catch (e: any) {
			fastify.log.warn(`[ REFRESH ] : ${e}`);
			deleteAccessCookie(res);
			deleteRefreshCookie(res);
			return res.status(401).send({ message: e.message });
		};

		setAccessCookie(generateToken(user, Jwt_type.access, '5min'), res);
		res.status(200)
	});
	
}

export default authRoutes;

