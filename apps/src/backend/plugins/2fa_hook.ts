import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';


const tfa_validate_hook:FastifyPluginAsync =  async(fastify) =>{
  fastify.addHook('preHandler', async (req, res) => {
    try {
      await req.jwtVerify();
	  //special 2fa_ lgic here
    } catch {
      return res.status(401).send({ message: 'INVALIDEXPIRED' });
    }
  });
}
export default fp(tfa_validate_hook);
