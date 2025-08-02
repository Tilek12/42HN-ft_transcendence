import fp from 'fastify-plugin';
import { getPresenceUsers } from '../websocket/presence';
const onlineUsersRoute = async (fastify) => {
    fastify.get('/online-users', async (req, res) => {
        const users = getPresenceUsers().map(u => ({ id: u.id }));
        res.send(users);
    });
};
export default fp(onlineUsersRoute);
