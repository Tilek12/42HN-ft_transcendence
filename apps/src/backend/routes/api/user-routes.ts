import { FastifyPluginAsync } from 'fastify';
import { findUserById } from '../../database/user';
// import { userManager } from '../../service-managers/user-manager';
import type { JWTPayload } from '../../types';
import { userManager } from '../../service-managers/user-manager';


const userRoutes: FastifyPluginAsync = async (fastify) => {

	fastify.get('/me', async (req, res) => {
		const payload = req.user as JWTPayload;
		const user = await findUserById(payload.id);
		// console.log(user);
		if (!user)
			return res.status(401).send({ message: 'User not found' });
		else if ( userManager.getUser(payload.id))
			return res.status(401).send({ message: 'User already logged in' });
		return res.status(200).send({
			id: user.id,
			username: user.username,
		});
	});

	//unused...
	// fastify.get('/online-users', async (req, res) => {
	//   const users = userManager.getOnlineUsers().map(u => ({ id: u.id }));
	//   res.send(users);
	// });
};

export default userRoutes;
