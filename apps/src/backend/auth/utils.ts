import bcrypt from 'bcrypt';
import { JWTPayload } from '../backendTypes';
import { FastifyRequest } from 'fastify';
import { Jwt_type } from '../backendTypes';


export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

export async function verifyUserJWT(req: FastifyRequest, type: Jwt_type[]): Promise<boolean> {
	try {
		await req.jwtVerify();
		const payload = req.user as JWTPayload;
		if (type.includes(payload.type))
			return true;
	}
	catch (e) { console.log(e) }
	return false;
} 