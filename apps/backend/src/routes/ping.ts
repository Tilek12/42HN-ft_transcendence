import { FastifyPluginAsync } from 'fastify';

const pingRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/ping', async () => {
    return { pong: true };
  });
};

export default pingRoutes;
