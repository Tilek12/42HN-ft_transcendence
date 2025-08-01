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
  parseFriends,
  bidirectionalAddAFriend,
  parseProfiles,
  bidirectionalDeleteAFriend,
  isExistsFriendRequest,
  addFriendRequest,
  parseBidirectionalPendingRequests,
  deleteFriendRequest,
  parseBlockedList,
  AddToBlockedList,
  DeleteFromBlockedList,
  userIsBlocked,
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
	});
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
	});

	fastify.post('/delete_pic', async (req, res) => {
		try {
			const jwt = await req.jwtVerify();
			const profile = await findProfileById(jwt.id);
			if (profile.image_path && profile.image_path !== 'default_pic.webp')
			{
				const filePath = path.join(__dirname, 'assets', 'profile_pics', profile.image_path);
				if (fs.existsSync(filePath))
					fs.unlinkSync(filePath);
			}
			await updatePicturePath(jwt.id, 'default_pic.webp');
			res.send({message: 'Profile picture deleted and reset to default'});
		} catch(err) {
			res.status(401).send({message: 'Unauthorized or error'});
		}
	});
	fastify.get('/parse-friends', async (req, res) =>
	{
		try {
			const jwt = await req.jwtVerify();
			console.log('Verified JWT: ', jwt);
			const userId = jwt.id;
			// await bidirectionalAddAFriend(userId, 2);
			const rows = await parseFriends(userId);
			res.send({friends: rows});
		} catch (err)
		{
			res.status(401).send({message: 'Umauthorized'});
			console.log(err);
		}
	} );

	fastify.post('/unlink-profile', async (req, res) =>
		{
			try {
				const jwt = await req.jwtVerify();
				const userId = jwt.id;
				const {profileId} = req.body as any;
				await bidirectionalDeleteAFriend(userId, profileId);
			} catch (err)
			{
				res.status(401).send({message: 'Unauthorized'});
				console.log(err);
			}
		});
		fastify.post('/block-profile', async (req, res) =>
			{
				try {
					const jwt = await req.jwtVerify();
					const userId = jwt.id;
					const {profileId} = req.body as any;
					await AddToBlockedList(userId, profileId);
					await bidirectionalDeleteAFriend(userId, profileId);
				} catch (err)
				{
					res.status(401).send({message: 'Unauthorized'});
					console.log(err);
				}
			});
		fastify.post('/unblock-profile', async (req, res) =>
			{
				try {
					const jwt = await req.jwtVerify();
					const userId = jwt.id;
					const {profileId} = req.body as any;
					await DeleteFromBlockedList(userId, profileId);
				} catch (err)
				{
					res.status(401).send({message: 'Unauthorized'});
					console.log(err);
				}
			});
	fastify.post('/link-profile', async (req, res) =>
		{
			try {
				const jwt = await req.jwtVerify();
				const userId = jwt.id;
				const {profileId} = req.body as any;
				console.log('userid====>',userId);
				console.log(profileId);
				await addFriendRequest(userId, profileId);
			} catch (err)
			{
				res.status(401).send({message: 'Unauthorized'});
				console.log(err);
			}
		});
	fastify.post('/pending-request', async (req, res) =>
	{
		try{
			const jwt = await req.jwtVerify();
			const userId = jwt.id;
			const {profileId} = req.body as any;
			await deleteFriendRequest(userId, profileId); 
		} catch (err)
		{
			res.status(401).send({message: 'Unauthorized'});
			console.log(err);
		}
	})

	fastify.post('/answer-request', async (req, res)=>
	{
		try{
			console.log("here");
			const jwt =await req.jwtVerify();
			const userId = jwt.id;
			const {profileId, profileAnswer} = req.body as any;
			console.log("profileId and profileAnswer");
			console.log(req.body);
			if (profileAnswer === 'accept')
				await bidirectionalAddAFriend(userId, profileId);
			await deleteFriendRequest(profileId, userId);
			await deleteFriendRequest(userId, profileAnswer);
		} catch(err)
		{
			res.status(401).send({message: 'Unauthorized'});
			console.log(err);
		}
	})
	fastify.get('/parse-profiles', async (req, res) =>
		{
			try {
				const jwt = await req.jwtVerify();
				const profiles = await parseProfiles(jwt.id);

				const friends = await parseFriends(jwt.id);
				const friendsIds = new Set (friends.map((row : any )=> row.id));

				const pendingRequests = await parseBidirectionalPendingRequests(jwt.id, jwt.id);
				const sentRequests = new Set ( pendingRequests.filter((r: any)=> r.sender_id === jwt.id && r.receiver_id !== jwt.id).map((r : any)=>  r.receiver_id));
				const receivedRequests = new Set (pendingRequests.filter((r: any) => r.receiver_id && r.sender_id !== jwt.id).map((r: any) => r.sender_id));

				const blockingList = await parseBlockedList(jwt.id);
				console.log("Blocked_list:");
				console.log(blockingList);
				const blockingListIds = new Set (blockingList.map((row : any)=> row.blocked_id));
				const profilesWithFriendFlag = await Promise.all(profiles.map(async (profile :any) => 
					(
						{...profile, 
							is_friend : friendsIds.has(profile.id),
							received_requests: Array.from(receivedRequests),
							pending_direction: sentRequests.has(profile.id) ? "sent" : 
											   receivedRequests.has(profile.id) ? "recieved" :
											   null,
							is_blocking: blockingListIds.has(profile.id) ? 1 : 0,
							is_blocked: await userIsBlocked(jwt.id, profile.id)
						}
					)));
				res.send({profiles: profilesWithFriendFlag});
				console.log(profilesWithFriendFlag);
			} catch (err)
			{
				res.status(401).send({message: 'Unauthorized'});
				console.log(err);
			}
		} )
};



export default authRoutes;

