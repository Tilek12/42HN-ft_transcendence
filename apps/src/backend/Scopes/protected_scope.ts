import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { verifyUserJWT } from '../auth/utils';
import { Jwt_type } from '../types';


// only registered in protected scope
const protected_validate_hook: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', async (req, res) => {
    const ret = await verifyUserJWT(req, [Jwt_type.normal]);
    if (!ret)
      return res.status(401).send({ message: 'Invalid or expired token' });
    });
};
export default fp(protected_validate_hook);


