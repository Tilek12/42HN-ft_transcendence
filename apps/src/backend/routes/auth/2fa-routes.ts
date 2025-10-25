import { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { enable_TFA_Schema, verify_TFA_Schema, disable_TFA_Schema } from '../../auth/schemas';
import { enable_TFA_body, verify_TFA_body, disable_TFA_body } from '../../auth/schemas';
import { verifyPassword } from '../../auth/utils';

import { generateqrcode, generateSecret, validate_2fa_token } from '../../2FA/2fa';
import { JWTPayload } from '../../Scopes/authtypes';
import { findUserById } from '../../database/user';
import { store2faKey, delete2faKey } from '../../database/2fa';
import { updateProfileLogInState } from '../../database/profile';


const tfa_Routes: FastifyPluginAsync = async (fastify: FastifyInstance) => {

	//enables the 2fa auth logic, needs a valid jwt token sends out the 2fa secret as qrcode.
	fastify.post<{ Body: enable_TFA_body }>('/enable', { schema: enable_TFA_Schema }, async (req, res) => {
		try {
			await req.jwtVerify();
		}
		catch (e: any) {
			if (e.message == "expired tmp token")
				return res.status(401).send({ message: 'EXPIRED_TMP' });

			return res.status(401).send({ message: 'INVALID' });
		}
		const payload = req.user as JWTPayload;
		const user = await findUserById(payload.id);

		if (!user || user.is_logged_in || !user.tfa)
			return res.status(401).send({ message: 'INVALID_USER' });
		const secret = generateSecret();
		store2faKey(user.id, secret);
		const qr = await generateqrcode(secret);
		return res.status(200).send({ qr: qr });
	});

	//disables the 2fa auth functionality. needs username, passsowrd 2fa_token and jwt
	fastify.post<{ Body: disable_TFA_body }>('/disable', { schema: verify_TFA_Schema }, async (req, res) => {
		try {
			await req.jwtVerify();
		}
		catch (e: any) {
			if (e.message == "expired tmp token")
				return res.status(401).send({ message: 'EXPIRED_TMP' });

			return res.status(401).send({ message: 'INVALID' });
		}
		const payload = req.user as JWTPayload;
		const { username, password, tfa_token } = req.body;

		const user = await findUserById(payload.id);
		if (!user || !(await verifyPassword(password, user.password)) || username !== user.username) {
			return res.status(401).send({ message: 'Invalid credentials' });
		}
		if (!validate_2fa_token(tfa_token, user.tfa_secret))
			return res.status(401).send({ message: "INVALID_TFA_TOKEN" });
		delete2faKey(user.id);
		return res.status(200).send({ message: "SUCCESS" });
	});


	// sends jwt | needs jwt token, 2fa_token
	fastify.post<{ Body: verify_TFA_body }>('/verify', { schema: verify_TFA_Schema }, async (req, res) => {
		const payload = req.user as JWTPayload;
		const { tfa_token } = req.body;
		const user = await findUserById(payload.id);
		console.log(user);
		if (!user){
			return res.status(401).send({ message: "INVALID_USER" });
		}
		if (!tfa_token){
			return res.status(401).send({ message: "INVALID_NO_TOKEN" })
		}
		if (user.is_logged_in) {
			return res.status(401).send({ message: "INVALID_USER_LOGGED_IN" });
		}
		if (!validate_2fa_token(tfa_token, user.tfa_secret)){
			return res.status(401).send({message: "INVALID_TOKEN"});
		}

		payload.type = "normal";
		const jwt = fastify.jwt.sign(payload, { expiresIn: '2h' });
		await updateProfileLogInState(user.id, true);
		
		return res.status(200).send({ jwt:jwt, ok:1 });
	});

}
export default tfa_Routes;
