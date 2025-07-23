import { FastifyPluginAsync } from 'fastify';
import { hashPassword, verifyPassword } from './utils';
import { loginSchema, registerSchema } from './schemas';
import {
  findUserByUsername,
  findUserByEmail,
  createUser, 
  findProfileByUsername,
  findProfileByEmail,
  updateProfileLogInState,
  createProfile,
  incrementWinsOrLossesOrTrophies,
  findProfileById,
  findUserById,
} from '../database/user';

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Register
  fastify.post('/register', { schema: registerSchema }, async (req, res) => {
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
  fastify.post('/login', { schema: loginSchema }, async (req, res) => {
    const { username, password } = req.body as any;
    const user = await findUserByUsername(username);
    if (!user || !(await verifyPassword(password, user.password))) {
      return res.status(401).send({ message: 'Invalid credentials' });
    }
	await updateProfileLogInState(user.id, true);
	//----testing---------
	// await incrementWinsOrLossesOrTrophies(user.id, 'wins');
    const token = fastify.jwt.sign({ id: user.id }, { expiresIn: '2h' });
    res.send({ token });
  });

  fastify.post('/logout', async (req, res) =>
  {
		  const user = await req.jwtVerify();
		  await updateProfileLogInState(user.id, false);
		  res.send({message: 'Logged out successfully'});
  });

  fastify.post ('/profile', async (req, res) =>
{
	try
	{
		const jwt = await req.jwtVerify();
		const user = await findUserById(jwt.id);
		const profile = await findProfileById(jwt.id);
		console.log(profile);
		if (!user || !profile)
			return res.status(404).send({message: 'User or profile not found'});
		res.send(
			{	
				profile: 
				{
					logged_in: profile.logged_in,
					wins: profile.wins,
					losses: profile.losses,
					trophies: profile.trophies,
				}, 
				user: 
				{
					username: user.username,
					email: user.email,
					created_at: user.created_at,
				}
			}
	)
	} catch (err) {
		res.status(401).send({message: 'Invalid or expired token'});
	}
})
};
export default authRoutes;

