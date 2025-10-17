import { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import type {toggle_TFA_body} from '../../auth/schemas';
import { toggle_TFA_Schema} from '../../auth/schemas';
import { verifyPassword } from '../../auth/utils';

import { generateqrcode, generateSecret } from '../../2FA/2fa';
import { JWTPayload } from '../../plugins/authtypes';
import { findUserById } from '../../database/user';
import { store2faKey, delete2faKey } from '../../database/2fa';
const authRoutes: FastifyPluginAsync = async (fastify : FastifyInstance) => {


	fastify.post<{Body: toggle_TFA_body}>('/toggle', {schema: toggle_TFA_Schema}, async (req : FastifyRequest, res : FastifyReply) => {
		try {
			await req.jwtVerify();
		}
		catch{
			return res.status(401).send({ message: 'Invalid or expired token' });
		}
		const { enable, password, TFA_token } = req.body as toggle_TFA_body;
		const payload = req.user as JWTPayload;
		const user = await findUserById(payload.id);
	
		if (!user || !(await verifyPassword(password, user.password)))
			return res.status(401).send({ message: 'Invalid credentials' });
		if (enable)
		{
			if (user.tfa)
				return res.status(400).send({message: 'already enabled 2fa'});
			user.tfa_secret = generateSecret();
			user.tfa = true;
			await store2faKey(user.id, user.tfa_secret);
			const qrstring = generateqrcode(user.tfa_secret);
			return res.status(200).send({qr: qrstring});
		}
		else
		{
			if (!TFA_token)
				return res.status(400).send({ message: 'missing 2FA token' });
			await delete2faKey(user.id);
			res.status(200).send({message: "success"});
		}



	});
}
export default authRoutes;
