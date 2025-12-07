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
	parseIBlockedList,
	AddToBlockedList,
	DeleteFromBlockedList,
	userIsBlocked,
	parseBlockedMeList,
	parsePendingRequests,
	parseProfilesForTotalGamesChart,
} from '../../database/profile';
import { verifyPassword, hashPassword } from '../../auth/utils';
import { JWTPayload } from '../../backendTypes';
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
import type { Profile, ProfileListEntry } from '../../backendTypes';
import { blockStatus, friendRequest } from '../../../backend/backendTypes';
import { userManager } from '../../service-managers/user-manager';
import { sendRenderUpdate, sendRenderUpdateAll } from '../ws/presence-ws';
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
					image_blob: profile.image_blob ? profile.image_blob.toString("base64") : null,
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
					sendRenderUpdateAll();
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
					sendRenderUpdateAll();
				} catch (err) {
					res.status(400).send({ message: 'Unauthorized or error delete_pic' });
				}
			});


	fastify.get<{ Querystring: parseProfilesQuery }>
		('/parse-friends',
			{ schema: parseProfilesSchema },
			async (req, res) => {
				try {
					const jwt = req.user as JWTPayload;
					const userId = jwt.id;
					const rows = await parseFriends(userId, req.query.offset, req.query.limit);

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

					sendRenderUpdate(Number(profileId));
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
					console.log(`[ BLOCK ] Me: ${jwt.username}, ${userId}  toBlock: ${profileId}`)
					await AddToBlockedList(userId, Number(profileId));
					await bidirectionalDeleteAFriend(userId, Number(profileId));
					
					sendRenderUpdate(Number(profileId));
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
					sendRenderUpdate(Number(profileId));
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
					const iBlock = await userIsBlocked(userId, Number(profileId));
					const blocksMe = await userIsBlocked(Number(profileId), userId)
					if (blocksMe) //in case a request is made by manipulating js code in tghe client. bc frontend just hides the link-btn on block
						return;
					if (iBlock)
						await DeleteFromBlockedList(userId, Number(profileId));
					await addFriendRequest(userId, Number(profileId));
					sendRenderUpdate(Number(profileId));
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
					sendRenderUpdate(userId);
				} catch (err: any) {
					res.status(400).send({ message: err.message });
					console.log(err);
				}
			});


		fastify.get
			('/friendrequests',
				{ schema: ParseSchema },
				async (req, res) => {
					try {
						const jwt = req.user as JWTPayload;
						//find all requests where I'm the receiver
						const pendingRequests: friendRequest[] = await parsePendingRequests(jwt.id);
						// take the sender IDS
						const senderIDs = pendingRequests.map((f: friendRequest) => f.sender_id)
						// find corresponding profiles
						const rawSenderProfiles: Profile[] = await Promise.all(senderIDs.map(async (id: number) => findProfileById(id)));
						// turn all profile pictures to base64 encoded strings
						const senderProfiles = rawSenderProfiles.map((profile: Profile) => {
							if (profile.image_blob) {
								profile.image_blob = (profile.image_blob as any).toString("base64");
							}
							return profile;

						});
						res.status(200).send({ requestProfiles: senderProfiles });
					} catch (err: any) {
						res.status(400).send({ message: err.message });
						console.log(err);
					}
				});



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
						sendRenderUpdate(Number(profileId));
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
					sendRenderUpdateAll();
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



						// get all profiles
						const rawProfiles = await parseProfiles(jwt.id, offset, limit);

						// turn all profile pictures to base64 encoded strings
						const profiles = rawProfiles.map((profile: Profile) => {
							if (profile.image_blob) {
								profile.image_blob = (profile.image_blob as any).toString("base64");
							}
							return profile;
						});

						// get all friends
						const friends = await parseFriends(jwt.id);

						// make a set of ids I am friends with
						const friendsIds: Set<number> = new Set(friends.map((row: Profile) => row.id));

						// get all pending friend requests 
						const pendingRequests: friendRequest[] = await parseBidirectionalPendingRequests(jwt.id, jwt.id);

						// set of ids of users tI have sent request to 
						const sentRequests: Set<number> = new Set(pendingRequests.filter((r: friendRequest) => (r.sender_id === jwt.id) && (r.receiver_id !== jwt.id)) // get all requests sent from user
							.map((r: friendRequest) => r.receiver_id)); // get the receiver id of those

						// set of ids request to me
						const receivedRequests = new Set(pendingRequests.filter((r: friendRequest) => r.receiver_id && r.sender_id !== jwt.id)
							.map((r: friendRequest) => r.sender_id));

						// array of block status where i am the user_id so the blocker
						const IBlockedList: blockStatus[] = await parseIBlockedList(jwt.id);

						const BlockedMeList: blockStatus[] = await parseBlockedMeList(jwt.id);

						// set of ids that I blocked 
						const IBlockedSet: Set<number> = new Set(IBlockedList.map((row: blockStatus) => row.blocked_id));

						//set of ids that blocked me
						const BlockedMeSet: Set<number> = new Set(BlockedMeList.map((row: blockStatus) => row.user_id));



						//assemble final profile list with neccessary info
						let profileList: ProfileListEntry[] = [];

						// filter out friends
						profiles.forEach((profile: Profile) => {
							if (friendsIds.has(profile.id)) {
								return;
							}
							profileList.push({
								...profile, //all profile values
								friendrequest: sentRequests.has(profile.id) ? "sent" : receivedRequests.has(profile.id) ? "received" : null,
								iBlock: IBlockedSet.has(profile.id),
								blocksMe: BlockedMeSet.has(profile.id),
							});


						});
						// profileList.forEach((p: ProfileListEntry) => {
						// 	console.log("id:", p.id);
						// 	console.log("username", p.username);
						// 	console.log("created_at", p.created_at);
						// 	console.log("wins", p.wins);
						// 	console.log("losses", p.losses);
						// 	console.log("trophies", p.trophies);
						// 	console.log("image_blob", !!p.image_blob);
						// 	console.log("friendrequest", p.friendrequest);
						// 	console.log("iBlock", p.iBlock);
						// 	console.log("blocksMe", p.blocksMe);
						// 	console.log('------------------------');
						// })
						res.send({ profilesList: profileList });
					} catch (err) {
						res.status(401).send({ message: 'Unauthorized parse_profiles' });
					}
				});


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
