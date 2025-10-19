import { FastifyPluginAsync } from 'fastify';
import fp, { fastifyPlugin } from 'fastify-plugin';


// only registered in protected scope
const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', async (req, res) => {
    try {
      await req.jwtVerify();

    } catch {
      return res.status(401).send({ message: 'Invalid or expired token' });
    }
  });
};

export default fp(authPlugin);

