import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';

export function Errorhandler(	error: FastifyError,
								request: FastifyRequest,
								reply: FastifyReply)
{
if (error.validation) {
	let message = error.message;
	if (message.startsWith("body/password must match pattern"))
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
	reply.send(error);
}
};