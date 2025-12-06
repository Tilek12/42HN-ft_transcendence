import { FastifyPluginAsync } from 'fastify';
import { findUserById } from '../../database/user';
// import { userManager } from '../../service-managers/user-manager';
import type { JWTPayload } from '../../backendTypes';
import { userManager } from '../../service-managers/user-manager';


type fUser = {
  id:number;
  username: string,
  created_at: string,
  image_blob:string | undefined;
  wins:number,
  losses:number,
  trophies:number,
  tfa:boolean,
}

const userRoutes: FastifyPluginAsync = async (fastify) => {

	fastify.get('/me', async (req, res) => {
		const payload = req.user as JWTPayload;
		const user = await findUserById(payload.id);
		// console.log(user);
		if (!user)
			return res.status(401).send({ message: 'User not found' });
		// else if ( userManager.getUser(payload.id))
		// 	return res.status(401).send({ message: 'User already logged in' });
		const fuser:fUser = {
			id:user.id,
			username:user.username,
			created_at: user.created_at,
			image_blob:undefined,
			wins:0,
			losses:0,
			trophies:0,
			tfa:user.tfa,
		}

		return res.status(200).send({user:fuser});
	});

	//unused...
	// fastify.get('/online-users', async (req, res) => {
	//   const users = userManager.getOnlineUsers().map(u => ({ id: u.id }));
	//   res.send(users);
	// });
};

export default userRoutes;
