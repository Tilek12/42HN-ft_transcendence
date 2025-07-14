import { FastifyPluginAsync } from 'fastify';
import { findUserById } from '../database/user';

const userRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.register(import('../plugins/auth')); // middleware for protected routes

  fastify.get('/api/me', async (req, res) => {
    const userId = req.user;
    const user = await findUserById(userId);

    if (!user) return res.status(404).send({ message: 'User not found' });

    const { password, ...safeUser } = user;
    return res.send(safeUser);
  });
};

export default userRoutes;

