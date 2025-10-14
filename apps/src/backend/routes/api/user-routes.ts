import { FastifyPluginAsync } from 'fastify';
import { findUserById } from '../../database/user';
import { userManager } from '../../service-managers/user-manager';
import type { JWTPayload } from '../../plugins/authtypes';
// import { JWT } from '@fastify/jwt';
// import { JwkKeyExportOptions } from 'crypto';

const userRoutes: FastifyPluginAsync = async (fastify) => {
	fastify.get('/me', async (req, res) => {
		const payload = req.user as JWTPayload;
		const user = await findUserById(payload.id);
		console.log(user);
		if (!user) return res.status(404).send({ message: 'User not found' });

		const { password, ...safeUser } = user;
		res.send(safeUser);
	});

	fastify.get('/online-users', async (req, res) => {
	  const users = userManager.getOnlineUsers().map(u => ({ id: u.id }));
	  res.send(users);
	});
};

export default userRoutes;
