import type { FastifyPluginAsync } from 'fastify';
import { findUserById } from '../../database/user.js';
import { userManager } from '../../service-managers/user-manager.js';

const userRoutes: FastifyPluginAsync = async (fastify) => {
	fastify.get('/me', async (req, res) => {
		const user = await findUserById(req.user);
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
