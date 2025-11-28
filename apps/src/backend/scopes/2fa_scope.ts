import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { verifyUserJWT } from '../auth/utils';
import { Jwt_type } from '../types';

//only registerd for 2fa_scope
const tfa_validate_hook: FastifyPluginAsync = async (fastify) => {
	fastify.addHook('preHandler', async (req, res) => {
		const ret = await verifyUserJWT(req, [Jwt_type.access, Jwt_type.temp]);
		if (!ret)
			return res.status(401).send({ message: 'Invalid or expired token' });
	});
}
export default fp(tfa_validate_hook);
