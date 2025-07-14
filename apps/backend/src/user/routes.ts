import { FastifyPluginAsync } from 'fastify';
import { findUserById } from '../database/user';

const userRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/api/me', {
    preHandler: fastify.verifyAuth,
    handler: async (req, res) => {
      const user = await findUserById(req.user);
      if (!user) return res.status(404).send({ message: 'User not found' });

      const { password, ...safeUser } = user;
      return res.send(safeUser);
    }
  });
};

export default userRoutes;

