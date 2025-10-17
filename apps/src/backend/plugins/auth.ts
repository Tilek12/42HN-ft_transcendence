import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
// import type { JWTPayload } from './authtypes'


const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', async (req, res) => {
    if (!req.url.startsWith('/api/private')) return;

    try {
      await req.jwtVerify();

    } catch {
      return res.status(401).send({ message: 'Invalid or expired token' });
    }
  });
};

export default fp(authPlugin);
