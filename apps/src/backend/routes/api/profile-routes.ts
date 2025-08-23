import fs from 'fs';
import sharp from 'sharp';
import path from 'path';

import type { FastifyPluginAsync } from 'fastify';
import { findUserById } from '../../database/user.js';
import {
	findProfileById,
	updatePicturePath,
	parseFriends,
	bidirectionalAddAFriend,
	parseProfiles,
	bidirectionalDeleteAFriend,
	addFriendRequest,
	parseBidirectionalPendingRequests,
	deleteFriendRequest,
	parseBlockedList,
	AddToBlockedList,
	DeleteFromBlockedList,
	userIsBlocked,
} from '../../database/profile.js';

const profileRoutes: FastifyPluginAsync = async (fastify : any) => {
	fastify.post ('/profile', async (req : any, res : any) => {
		try {
			const jwt = await req.jwtVerify();
			const user = await findUserById(jwt.userid);
			const profile = await findProfileById(jwt.userid);
			if (!user || !profile)
				return res.status(404).send({message: 'User or profile not found'});
			res.send({
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
			})
		} catch (err) {
			res.status(401).send({message: 'Invalid or expired token'});
		}
	});

	fastify.post ('/upload_pic', async (req : any, res : any) => {
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
			const fileName = `user_${jwt.userid}_${Date.now()}.webp`;
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
			await updatePicturePath(jwt.userid, relativePath);
			res.send({message: 'Profile picture updated and resized', path: relativePath});
		} catch (err) {
			console.error(err);
			res.status(500).send({message: 'Upload failed'});
		}
	});

	fastify.post('/delete_pic', async (req : any, res : any) => {
		try {
			const jwt = await req.jwtVerify();
			const profile = await findProfileById(jwt.userid);
			if (profile.image_path && profile.image_path !== 'default_pic.webp')
			{
				const __dirname = '/app/src';
				const filePath = path.join(__dirname, 'assets', 'profile_pics', profile.image_path);
				if (fs.existsSync(filePath))
					fs.unlinkSync(filePath);
			}
			await updatePicturePath(jwt.userid, 'default_pic.webp');
			res.send({message: 'Profile picture deleted and reset to default'});
		} catch(err) {
			res.status(401).send({message: 'Unauthorized or error delete_pic'});
		}
	});

	fastify.get('/parse-friends', async (req : any, res : any) => {
		try {
			const jwt = await req.jwtVerify();
			// console.log('Verified JWT: ', jwt);
			const userId = jwt.userid;
			const rows = await parseFriends(userId);
			res.send({friends: rows});
		} catch (err) {
			res.status(401).send({message: 'Unauthorized parse_friends'});
			console.log(err);
		}
	});

	fastify.post('/unlink-profile', async (req : any, res : any) => {
		try {
			const jwt = await req.jwtVerify();
			const userId = jwt.userid;
			const {profileId} = req.body as any;
			await bidirectionalDeleteAFriend(userId, profileId);
		} catch (err) {
			res.status(401).send({message: 'Unauthorized unlink_profile'});
			console.log(err);
		}
	});

	fastify.post('/block-profile', async (req : any, res : any) => {
		try {
			const jwt = await req.jwtVerify();
			const userId = jwt.userid;
			const {profileId} = req.body as any;
			await AddToBlockedList(userId, profileId);
			await bidirectionalDeleteAFriend(userId, profileId);
		} catch (err) {
			res.status(401).send({message: 'Unauthorized block_profile'});
			console.log(err);
		}
	});

	fastify.post('/unblock-profile', async (req : any, res : any) => {
		try {
			const jwt = await req.jwtVerify();
			const userId = jwt.userid;
			const {profileId} = req.body as any;
			await DeleteFromBlockedList(userId, profileId);
		} catch (err) {
			res.status(401).send({message: 'Unauthorized unbock_profile'});
			console.log(err);
		}
	});

	fastify.post('/link-profile', async (req : any, res : any) => {
		try {
			const jwt = await req.jwtVerify();
			const userId = jwt.userid;
			const {profileId} = req.body as any;
			// console.log('userid====>',userId);
			// console.log(profileId);
			const is_blocking = await userIsBlocked(profileId, userId);
			if (is_blocking)
				await DeleteFromBlockedList(userId, profileId);
			await addFriendRequest(userId, profileId);
		} catch (err) {
			res.status(401).send({message: 'Unauthorized link_profile'});
			console.log(err);
		}
	});

	fastify.post('/pending-request', async (req : any, res : any) => {
		try {
			const jwt = await req.jwtVerify();
			const userId = jwt.userid;
			const {profileId} = req.body as any;
			await deleteFriendRequest(userId, profileId);
		} catch (err) {
			res.status(401).send({message: 'Unauthorized pending_request'});
			console.log(err);
		}
	});

	fastify.post('/answer-request', async (req : any, res : any)=> {
		try {
			// console.log("here");
			const jwt =await req.jwtVerify();
			const userId = jwt.userid;
			const {profileId, profileAnswer} = req.body as any;
			// console.log("profileId and profileAnswer");
			// console.log(req.body);
			if (profileAnswer === 'accept')
				await bidirectionalAddAFriend(userId, profileId);
			await deleteFriendRequest(profileId, userId);
			await deleteFriendRequest(userId, profileAnswer);
		} catch(err) {
			res.status(401).send({message: 'Unauthorized answer_request'});
			console.log(err);
		}
	});

	fastify.get('/parse-profiles', async (req : any, res : any) => {
		try {
			const jwt = await req.jwtVerify();
			const offset = await req.query.offset as string || "0";
			const limit = await req.query.limit as string || "25";
			const profiles = await parseProfiles(jwt.userid, offset, limit);

			const friends = await parseFriends(jwt.userid);
			const friendsIds = new Set (friends.map((row : any )=> row.id));

			const pendingRequests = await parseBidirectionalPendingRequests(jwt.userid, jwt.userid);
			const sentRequests = new Set ( pendingRequests.filter((r: any)=> r.sender_id === jwt.userid && r.receiver_id !== jwt.userid).map((r : any)=>  r.receiver_id));
			const receivedRequests = new Set (pendingRequests.filter((r: any) => r.receiver_id && r.sender_id !== jwt.userid).map((r: any) => r.sender_id));

			const blockingList = await parseBlockedList(jwt.userid);
			// console.log("Blocked_list:");
			// console.log(blockingList);
			const blockingListIds = new Set (blockingList.map((row : any)=> row.blocked_id));
			const profilesWithFriendFlag = await Promise.all(profiles.map(async (profile :any) => ({
				...profile,
				is_friend : friendsIds.has(profile.id),
				received_requests: Array.from(receivedRequests),
				pending_direction: sentRequests.has(profile.id) ? "sent" :
									receivedRequests.has(profile.id) ? "recieved" :
									null,
				is_blocking: blockingListIds.has(profile.id) ? 1 : 0,
				is_blocked: await userIsBlocked(jwt.userid, profile.id)
			})
			));
				res.send({profiles: profilesWithFriendFlag});
				// console.log(profilesWithFriendFlag);
		} catch (err) {
				res.status(401).send({message: 'Unauthorized parse_profiles'});
				console.log(err);
		}
	})
};

export default profileRoutes;
