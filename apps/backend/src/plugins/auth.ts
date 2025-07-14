import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { verifyToken } from '../auth/utils';

const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorateRequest('user', null);

  fastify.addHook('onRequest', async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).send({ message: 'Missing or invalid token' });
    }

    try {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      req.user = decoded.id;
    } catch (err) {
      return res.status(401).send({ message: 'Invalid or expired token' });
    }
  });
};

export default fp(authPlugin);

