import { FastifyPluginAsync } from 'fastify';
import { findUserById } from '../../database/user';
import { userManager } from '../../service-managers/user-manager';
import type { JWTPayload } from '../../types';
// import { JWT } from '@fastify/jwt';
// import { JwkKeyExportOptions } from 'crypto';

const userRoutes: FastifyPluginAsync = async (fastify) => {
	fastify.get('/me', async (req, res) => {
		const payload = req.user as JWTPayload;
		if (!userManager.getUser(payload.id))
			return res.status(400).send({ message: 'User not found' });
		
		// i cant believe we were sending all userdata except password over??

		// const { password, ...safeUser } = user;
	});

	//unused...
	// fastify.get('/online-users', async (req, res) => {
	//   const users = userManager.getOnlineUsers().map(u => ({ id: u.id }));
	//   res.send(users);
	// });
};

export default userRoutes;
