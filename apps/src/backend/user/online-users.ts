import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { userManager } from './user-manager';

const onlineUsersRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get('/online-users', async (req, res) => {
    const users = userManager.getOnlineUsers().map(u => ({ id: u.id }));
    res.send(users);
  });
};

export default fp(onlineUsersRoute);
