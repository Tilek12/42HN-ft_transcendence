import fs from 'fs';
import sharp from 'sharp';
import path from 'path';

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
						image_path: profile.image_path,
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
	// get a profile when you are clicking on the username
	// fastify.get('profile/:id', async (req, res) =>
	// {
	// 	const {id} = req.params;
	// 	const user = await findUserById(id);
	// 	const profile = await findProfileById(id);
	// 	if (!user || !profile)
	// 		return res.status(404).send({message: 'User  not found'});
	// 	res.send(
	// 		{
	// 			username: user.username,
	// 			created_at: user.created_at,
	// 			image_path: profile.image_path,
	// 			wins: profile.wins,
	// 			losses: profile.losses,
	// 			trophies:profile.trophies
	// 		});
	// })
	fastify.post ('/upload_pic', async (req, res) =>
	{
		try {
			const jwt = await req.jwtVerify();
			const data = await req.file();
			if (!data)
				return res.status(400).send({message: 'No file uploaded'});
			const ext = path.extname(data.filename);
			const allowed = ['.png', '.jpg', '.jpeg'];
			if (!allowed.includes(ext.toLowerCase()))
					return res.status(400).send({message:'Invalid file type'});
			const __dirname = '/app/src';
			const dir = path.join(__dirname, 'assets', 'profile_pics');
			if (!fs.existsSync(dir))
				fs.mkdirSync(dir, { recursive: true });
			const fileName = `user_${jwt.id}_${Date.now()}.webp`;
			const uploadPath = path.join(__dirname, 'assets', 'profile_pics', fileName);
			//-----resizing-----------
			const chunks: Buffer[] = [];
			for await (const chunk of data.file)
				chunks.push(chunk);
			const buffer = Buffer.concat(chunks);

			await sharp(buffer)
				.resize(200, 200, {fit: 'cover', position: 'center',})
				.webp({ quality: 80})
				.toFile(uploadPath);
			//----uploading-------------
			const relativePath = `${fileName}`;
			await updatePicturePath(jwt.id, relativePath);
			res.send({message: 'Profile picture updated and resized', path: relativePath});
		} catch (err)
		{
			console.error(err);
			res.status(500).send({message: 'Upload failed'});
		}
	})

	fastify.post('/delete_pic', async (req, res) => {
		try {
			const jwt = await req.jwtVerify();
			const profile = await findProfileById(jwt.id);
			if (profile.image_path && profile.image_path !== 'default_pic.png')
			{
				const filePath = path.join(__dirname, 'assets', 'profile_pics', profile.image_path);
				if (fs.existsSync(filePath))
					fs.unlinkSync(filePath);
			}
			await updatePicturePath(jwt.id, 'default_pic.png');
			res.send({message: 'Profile picture deleted and reset to default'});
		} catch(err) {
			res.status(401).send({message: 'Unauthorized or error'});
		}
	})
// 	fastify.get('/friends', async (req, res) => {
// 		try
// 		{
// 			const jwt = await req.jwtVerify();
// 			const userId = jwt.id;
// 			const rows = await db.all(`
// 				SELECT
// 					u.id, u.username, u.created_at,
// 					p.wins, p.losses, p,trophies, p.image_path
// 				FROM friends f
// 				JOIN users u ON f.friend_id = u.id
// 				JOIN profiles p ON u.id = p.id
// 				WHERE f.user_id = ?`, userId);
// 			res.send({friends: rows});
// 		} catch (err)
// 		{
// 			res.status(401).send({message: 'Unauthorized'});
// 		}
// 	});
};

// friends endpoint


export default authRoutes;

