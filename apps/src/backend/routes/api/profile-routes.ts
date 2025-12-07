import sharp from 'sharp';
import path from 'path';

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { findUserById, isUsername, updateUsername, updatePasswordById } from '../../database/user';
import {
	findProfileById,
	updatePicture,
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
	parseProfilesForTotalGamesChart,
} from '../../database/profile';
import { verifyPassword, hashPassword } from '../../auth/utils';
import { JWTPayload } from '../../types';
import type {
	PasswordChangeBody,
	parseProfilesQuery,
	UsernameChangeBody,
	ProfileIdBody,
	DeletePicBody,
	UploadPicBody,

} from '../../auth/schemas'

import {
	PasswordChangeSchema,
	parseProfilesSchema,
	UsernameChangeSchema,
	AnswerRequestSchema,
	ProfileIdSchema,
	DeletePicSchema,
	UploadPicSchema,
	ParseSchema,
} from '../../auth/schemas'
import type { Profile } from '../../types';
const profileRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {


	fastify.get('/profile',
		async (req, res) => {
			try {
				const jwt = req.user as JWTPayload;
				const user = await findUserById(jwt.id);
				const profile = await findProfileById(jwt.id);
				if (!user || !profile)
					throw new Error('User or profile not found');
				res.status(200).send({
					username: user.username,
					image_blob: profile.image_blob?.toString("base64"),
					wins: profile.wins,
					losses: profile.losses,
					trophies: profile.trophies,
				})
			} catch (err: any) {
				res.status(400).send({ message: err.message });
			}
		});

	fastify.post<{ Body: UploadPicBody }>
		('/upload_pic',
			{ schema: UploadPicSchema },
			async (req, res) => {
				try {
					const jwt = req.user as JWTPayload;
					const data = await req.file();
					// console.log("Sended Data==========>>>>>",data);
					if (!data)
						return res.status(400).send({ message: 'No file uploaded' });
					const ext = path.extname(data.filename);
					const allowed = ['.png', '.jpg', '.jpeg'];
					if (!allowed.includes(ext.toLowerCase()))
						return res.status(400).send({ message: 'Invalid file type' });

					//-----resizing-----------
					const chunks: Buffer[] = [];
					for await (const chunk of data.file)
						chunks.push(chunk);
					const buffer = Buffer.concat(chunks);

					const compressed = await sharp(buffer)
						.resize(200, 200, { fit: 'cover', position: 'center', })
						.webp({ quality: 60 })
						.toBuffer();
					// console.log("=====>>Compresed", compressed);
					//----uploading-------------
					await updatePicture(jwt.id, compressed);
					const profile = await findProfileById(jwt.id);
					// console.log(profile);
					res.status(200).send({ message: 'Profile picture updated and resized', blob: profile.image_blob.toString("base64") });
				} catch (err) {
					console.error(err);
					res.status(500).send({ message: `Upload failed: ${err}` });
				}
			});

	fastify.post<{ Body: DeletePicBody }>
		('/delete_pic',
			{ schema: DeletePicSchema },
			async (req, res) => {
				try {
					const jwt = req.user as JWTPayload;
					const profile = await findProfileById(jwt.id);
					await updatePicture(jwt.id, null);
					res.send({ message: 'Profile picture deleted and reset to default' });
				} catch (err) {
					res.status(400).send({ message: 'Unauthorized or error delete_pic' });
				}
			});


	fastify.get
		('/parse-friends',
			{ schema: ParseSchema },
			async (req, res) => {
				try {
					const jwt = req.user as JWTPayload;
					const userId = jwt.id;
					const rows = await parseFriends(userId);
					
					res.send({ friends: rows });
				} catch (err: any) {
					res.status(400).send({ message: err.message });
					console.log(err);
				}
			});


	fastify.post<{ Body: ProfileIdBody }>
		('/unlink-profile',
			{ schema: ProfileIdSchema },
			async (req, res) => {
				try {
					const jwt = req.user as JWTPayload;
					const userId = jwt.id;
					const { profileId } = req.body;
					await bidirectionalDeleteAFriend(userId, Number(profileId));
				} catch (err: any) {
					res.status(400).send({ message: err.message });
					console.log(err);
				}
			});

	//Blocks a User
	fastify.post<{ Body: ProfileIdBody }>
		('/block-profile',
			{ schema: ProfileIdSchema },
			async (req, res) => {
				try {
					const jwt = req.user as JWTPayload;
					const userId = jwt.id;
					const { profileId } = req.body;
					await AddToBlockedList(userId, Number(profileId));
					await bidirectionalDeleteAFriend(userId, Number(profileId));
				} catch (err: any) {
					res.status(400).send({ message: err.message });
					console.log(err);
				}
			});

	// Unblocks a User 
	fastify.post<{ Body: ProfileIdBody }>
		('/unblock-profile',
			{ schema: ProfileIdSchema },
			async (req, res) => {
				try {
					const jwt = req.user as JWTPayload;
					const userId = jwt.id;
					const { profileId } = req.body as any;
					await DeleteFromBlockedList(userId, profileId);
				} catch (err: any) {
					res.status(400).send({ message: err.message });
					console.log(err);
				}
			});

	// Sends a Firend Request, if the user was blocked before, its now unblocked
	fastify.post<{ Body: ProfileIdBody }>
		('/link-profile',
			{ schema: ProfileIdSchema },
			async (req, res) => {
				try {
					const jwt = req.user as JWTPayload;
					const userId = jwt.id;
					const { profileId } = req.body;
					const is_blocking = await userIsBlocked(Number(profileId), userId);
					if (is_blocking)
						await DeleteFromBlockedList(userId, Number(profileId));
					await addFriendRequest(userId, Number(profileId));
				} catch (err: any) {
					res.status(400).send({ message: err.message });
					console.log(err);
				}
			});

	// Deletes a FriendRequest while its still pending
	fastify.post<{ Body: ProfileIdBody }>
		('/pending-request',
			{ schema: ProfileIdSchema },
			async (req, res) => {
				try {
					const jwt = req.user as JWTPayload;
					const userId = jwt.id;
					const { profileId } = req.body;
					await deleteFriendRequest(userId, Number(profileId));
				} catch (err: any) {
					res.status(400).send({ message: err.message });
					console.log(err);
				}
			});


	// fastify.get('/requests',
	// 		{ schema: ParseFriendsSchema },
	// 		async(req, res)=>{

	// });


	fastify.post<{ Body: { profileId: string, profileAnswer: string } }>
		('/answer-request',
			{ schema: AnswerRequestSchema },
			async (req, res) => {
				try {
					const jwt = req.user as JWTPayload;
					const userId = jwt.id;
					const { profileId, profileAnswer } = req.body;
					if (profileAnswer === 'accept')
						await bidirectionalAddAFriend(userId, Number(profileId));
					await deleteFriendRequest(Number(profileId), userId);
					await deleteFriendRequest(userId, Number(profileAnswer));
				} catch (err: any) {
					res.status(400).send({ message: err.message });
					console.log(err);
				}
			});


	fastify.post<{ Body: UsernameChangeBody }>
		('/update-username',
			{ schema: UsernameChangeSchema },
			async (req, res) => {
				const jwt = req.user as JWTPayload;
				const userId = jwt.id;
				const new_username = req.body.newUsername;

				const exists = await isUsername(new_username);
				if (exists)
					return res.status(400).send({ error: 'USERNAME_TAKEN ' });
				await updateUsername(userId, new_username);
				res.status(200).send({ success: true, new_username: new_username });
			});


	fastify.get<{ Querystring: parseProfilesQuery }>
		('/parse-profiles',
			{ schema: parseProfilesSchema },
			async (req, res) => {
				try {
					const jwt = req.user as JWTPayload;
					const offset = req.query.offset;
					const limit = req.query.limit;

					const profiles = await parseProfiles(jwt.id, offset, limit);
					// console.log ("backend-------------------<<<<>>>> :",profiles);
					const friends = await parseFriends(jwt.id);
					const friendsIds = new Set(friends.map((row: any) => row.id));

					const pendingRequests = await parseBidirectionalPendingRequests(jwt.id, jwt.id);

					const sentRequests = new Set(pendingRequests.filter((r: any) => r.sender_id === jwt.id && r.receiver_id !== jwt.id).map((r: any) => r.receiver_id));

					const receivedRequests = new Set(pendingRequests.filter((r: any) => r.receiver_id && r.sender_id !== jwt.id).map((r: any) => r.sender_id));

					const blockingList = await parseBlockedList(jwt.id);

					// console.log("Blocked_list:");
					// console.log(blockingList);
					const blockingListIds = new Set(blockingList.map((row: any) => row.blocked_id));

					const newProfiles = profiles.map((profile: any) => {
						if (profile.image_blob) {
							profile.image_blob = profile.image_blob.toString("base64");
						}
						return profile;
					});

					// console.log("Here ----------->>>> New Profiles: ", newProfiles);
					const profilesWithFriendFlag = await Promise.all(newProfiles
						.map(async (profile: any) => ({
							...profile,
							image_blob_setted: profile.image_blob ? true : false,
							is_friend: friendsIds.has(profile.id),
							received_requests: Array.from(receivedRequests),
							pending_direction: sentRequests.has(profile.id) ? "sent" :
								receivedRequests.has(profile.id) ? "recieved" :
									null,
							is_blocking: blockingListIds.has(profile.id) ? 1 : 0,
							is_blocked: await userIsBlocked(jwt.id, profile.id)
						})
						));
					// console.log(' Here ----->> BackEnd : ', profilesWithFriendFlag);

					res.send({ profiles: profilesWithFriendFlag });
					// console.log(profilesWithFriendFlag);
				} catch (err) {
					res.status(400).send({ message: 'Unauthorized parse_profiles' });
					console.log(err);
				}
			})
			
			fastify.post<{ Body: PasswordChangeBody }>
			('/update-password',
				{ schema: PasswordChangeSchema },
				async (req, res) => {
					try {
						const jwt = req.user as JWTPayload;
						const id = jwt.id;
						const user = await findUserById(id);
						if (user) {
							const is_password_verified = await verifyPassword(req.body.oldpassword, user.password);
							if (!is_password_verified)
								throw new Error("INVALID_PASSWORD");
							const hashed = await hashPassword(req.body.newpassword);
							await updatePasswordById(id, hashed);
							res.status(200).send({ message: 'User successfully updated his password!' });
						}
					} catch (e: any) {
						res.status(400).send({ message: e.message });
						console.log(e);
					}

			})

			fastify.get<{ Querystring: parseProfilesQuery }>
			('/parse-profiles-for-total-games-charts',
				{ schema: parseProfilesSchema },
				async (req, res) => {
					try {
						const profiles = await parseProfilesForTotalGamesChart();
						res.send({ profiles });
					} catch (err) {
						res.status(400).send({ message: 'Unauthorized parse_profiles' });
						console.log(err);
					}
			})
};

export default profileRoutes;
