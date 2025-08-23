import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import type { JwtPayload } from '../../shared/types/JwtPayload.js';

const authPlugin: FastifyPluginAsync = async (fastify) => {
	if (!fastify.hasRequestDecorator('user')) {
		fastify.decorateRequest('user');
	}

	fastify.addHook('onRequest', async (req, res) => {
		if (!req.url.startsWith('/api/private')) return;

		const authHeader = req.headers.authorization;
		if (!authHeader?.startsWith('Bearer ')) {
			return res.status(401).send({ message: 'Missing or invalid token' });
		}

		try {
			const decoded = await req.jwtVerify<JwtPayload>();
			req.user = decoded.userid;
		} catch {
			return res.status(401).send({ message: 'Invalid or expired token' });
		}
	});
};

export default fp(authPlugin);
