import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { getPresenceUsers } from '../websocket/presence';

const onlineUsersRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get('/online-users', async (req, res) => {
    const users = getPresenceUsers().map(u => ({ id: u.id }));
    res.send(users);
  });
};

export default fp(onlineUsersRoute);
