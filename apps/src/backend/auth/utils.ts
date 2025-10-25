import bcrypt from 'bcrypt';
import { JWTPayload } from '../types';
import { FastifyRequest } from 'fastify';
import { Jwt_type } from '../types';


export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}


export async function verifyUserJWT(req: FastifyRequest, type:Jwt_type[]) : Promise<boolean> {
try {
      await req.jwtVerify();
      const payload = req.user as JWTPayload;
      if (payload.type in type)
        return true;
      }
     catch { }
return false;
} 