import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';

export function Errorhandler(	error: FastifyError,
								request: FastifyRequest,
								reply: FastifyReply)
{

console.log("ERRORHANDLER: error:", error);
if (error.code === 'FST_ERR_VALIDATION')
{
	let message = error.message;
	if (message.startsWith("body/password must"))
	{
		message = "INVALID_PASSWORD";
	}
	// else if (message.startsWith(""))
	// 	message = "INVALID_EMAIL";

	reply.status(400).send({
	statusCode: 400,
	message: message,
	details: error.validation,
	});
}
else
{
	reply.send(error.message);
}
};