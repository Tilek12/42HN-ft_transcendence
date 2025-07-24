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
  updatePicturePath,
} from '../database/user';

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Register
  fastify.post('/register', { schema: registerSchema }, async (req, res) => {
    const { username, email, password } = req.body as any;
	console.log("break1");
    if (await findUserByUsername(username)) {
      return res.status(400).send({ message: 'Username already taken' });
    }

    if (await findUserByEmail(email)) {
      return res.status(400).send({ message: 'Email already registered' });
    }
	console.log("break2");
    const hashed = await hashPassword(password);
	console.log("break3");
    await createUser(username, email, hashed);
	console.log("break4");
	//-----Thomas--------
	await createProfile(username);
	console.log("break5");
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
					profile_pic: profile.path_or_url_to_image,
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
fastify.post('/update_pic',
	async (req, res) =>
	{
		try{
			const jwt = await req.jwtVerify();
			const profile_pic = req.body.profile_pic;
			await updatePicturePath(jwt.id, profile_pic); // the body is an object
			res.send({message: 'Profile picture updated'});
		}catch (err)
		{
			console.log("here7");
			res.status(401).send({message: 'Unauthorized or error'});
		}
	});
};

export default authRoutes;

