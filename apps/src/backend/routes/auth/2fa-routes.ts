import { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { enable_TFA_Schema, disable_TFA_Schema, verifyTFASchema, verifyTFAbody, cancel_TFA_Schema } from '../../auth/schemas';
import { enable_TFA_body, disable_TFA_body } from '../../auth/schemas';
import { verifyPassword, verifyUserJWT } from '../../auth/utils';

import { generateqrcode, generateSecret, validate_2fa_token } from '../../2FA/2fa';
import { JWTPayload, Jwt_type } from '../../types';
import { findUserById, log_in } from '../../database/user';
import { store2faKey, delete2faKey, update2faStatus } from '../../database/2fa';
import { setAccessCookie, setRefreshCookie } from '../../auth/cookies';
import { userManager } from '../../service-managers/user-manager';


const tfa_Routes: FastifyPluginAsync = async (fastify: FastifyInstance) => {

	let tfa_timeout: NodeJS.Timeout;

	//enables the 2fa auth logic, needs a valid jwt token sends out the 2fa secret as qrcode.
	fastify.post<{ Body: enable_TFA_body }>
		('/enable', {
			schema: enable_TFA_Schema,
			// onSend:function(req, res,payload, done){
			// 	fastify.log.info(payload);
			// 	done();
			// }
		},
			async (req, res) => {
				try {
					let jwt = req.headers['enablejwt'] as string | undefined;
					if (!jwt) {
						const result = fastify.unsignCookie(req.cookies.ACCESS || "");
						if (result.valid && result.value) {
							jwt = result.value;
						}

					}
					if (!jwt) {
						throw new Error('NO_TOKEN_OR_ACCESS_COOKIE');
					}
					else {
						const payload = fastify.jwt.verify(jwt) as JWTPayload;
						if (payload.type !== Jwt_type.enable && payload.type !== Jwt_type.access) {
							throw new Error('WRONG_TOKEN');
						}
						const user = await findUserById(payload.id);
						if (!user)
							throw new Error('INVALID_USER');
						else if (user.tfa)
							throw new Error('TFA_ALREADY_ENABLED');
						const secret = generateSecret();
						store2faKey(user.id, secret);

						const qr = await generateqrcode(user.username, secret);
						payload.type = Jwt_type.verify;
						payload.tfa = true;
						const verifyToken = fastify.jwt.sign(payload, { expiresIn: '5min' })
						res.status(201).send({ verifyjwt: verifyToken, qr: qr });
						tfa_timeout = setTimeout(async () => {
							const check = await findUserById(user.id);
							if (check && !check.tfa)
								delete2faKey(user.id);
						}, 300000)
					}
				}
				catch (e: any) {
					return res.status(401).send({ message: e.message });
				}
			});

	fastify.delete('/cancel',
		{	schema: cancel_TFA_Schema,
			preHandler: async (req, res) => {
				const ret = await verifyUserJWT(req, [Jwt_type.access]);
				if (!ret)
					return res.status(401).send({ message: 'Invalid or expired token' });
			}
		 },
		async (req, res) => {
			try {
				let jwt = req.headers['verifyjwt'] as string | undefined;
				if (!jwt) {
					throw new Error('NO_VERIFY_JWT');
				}
				else {
					const payload = fastify.jwt.verify(jwt) as JWTPayload;
					if (payload.type !== Jwt_type.verify) {
						throw new Error('WRONG_VERIFY_JWT');
					}
					const user = await findUserById(payload.id);
					if (!user)
						throw new Error('INVALID_USER');
					delete2faKey(user.id);
					clearTimeout(tfa_timeout);
				}
			}
			catch (e: any) {
				return res.status(401).send({ message: e.message });
			}
		});


	//disables the 2fa auth functionality. needs username, passsowrd 2fa_token and jwt
	fastify.post<{ Body: disable_TFA_body }>
		('/disable', { schema: disable_TFA_Schema },
			async (req, res) => {
				try {
					await req.jwtVerify();
				}
				catch (e: any) {
					return res.status(401).send({ message: e.message });
				}
				const payload = req.user as JWTPayload;
				if (payload.type !== Jwt_type.access)
					return res.status(401).send({ message: 'INVALID_ACCESS_TOKEN' })
				const { password, tfa_token } = req.body;

				const user = await findUserById(payload.id);
				if (!user || !(await verifyPassword(password, user.password))) {
					return res.status(401).send({ message: 'INVALID_CREDENTIALS' });
				}
				if (!validate_2fa_token(tfa_token, user.tfa_secret))
					return res.status(401).send({ message: "INVALID_TFA_TOKEN" });
				delete2faKey(user.id);
				update2faStatus(user.id, false);
				return res.status(200).send({ message: "SUCCESS" });
			});


	// sends jwt | needs jwt token, 2fa_token
	fastify.post<{ Body: verifyTFAbody }>
		('/verify', { schema: verifyTFASchema },
			async (req, res) => {
				try {
					const jwt = req.headers['verifyjwt'] as string | undefined;
					// console.log(jwt);
					let payload: JWTPayload;
					if (!jwt) {
						throw new Error('NO_TOKEN')
					} else {
						payload = fastify.jwt.verify(jwt) as JWTPayload; //throws on invalid
						// console.log("payload: ", payload);
						if (payload.type !== Jwt_type.verify) {
							throw new Error('INCORRECT_JWT');
						}
						const { tfa_token } = req.body;
						const user = await findUserById(payload.id);
						if (!user) {
							throw new Error('INVALID_USER');
						}
						if (!tfa_token) {
							throw new Error('INVALID_NO_TOKEN')
						}
						// if (user.is_logged_in) {
						// 	throw new Error('INVALID_USER_LOGGED_IN');
						// }
						if (!validate_2fa_token(tfa_token, user.tfa_secret)) {
							throw new Error('INVALID_TOKEN');
						}

						payload.type = Jwt_type.access;
						const accessToken = fastify.jwt.sign(payload, { expiresIn: '5min' });
						payload.type = Jwt_type.refresh;
						const refreshToken = fastify.jwt.sign(payload, { expiresIn: '1week' });
						log_in(user.id, refreshToken);
						update2faStatus(user.id, true);
						setAccessCookie(accessToken, res);
						setRefreshCookie(refreshToken, res);
						return res.status(200).send({ message: "SUCCESS" });
					}
				}
				catch (e: any) {
					console.log(e);
					return res.status(401).send({ message: e.message });
				}
			});

}
export default tfa_Routes;
