import { FastifyReply } from 'fastify';


// 1 Minute	60
// 1 Hour	3,600
// 1 Day	86,400
// 1 Week	604,800
// 1 Month	2,592,000
//set a refresh cookie that persists longer than access token
export function setRefreshCookie(token: string, res: FastifyReply) {
	res.setCookie('REFRESH', token, {
		path: '/api/refresh',
		maxAge: 604800,
		sameSite: 'strict',
		secure: true,
		httpOnly: true,
		signed:true,
	});
}


// set a short lived sccess token
export function setAccessCookie(token: string, res: FastifyReply) {
	res.setCookie('ACCESS', token, {
		path: '/',
		maxAge: 14400, //4hr
		sameSite: 'strict',
		secure: true,
		httpOnly: true,
		signed:true
	});
}


export function deleteRefreshCookie(res: FastifyReply) {
	res.setCookie('REFRESH', '', {
		path: '/api/refresh',
		maxAge: 0,
		sameSite: 'strict',
		secure: true,
		httpOnly: true,
		signed:true
	});
}

export function deleteAccessCookie(res: FastifyReply) {
	res.setCookie('ACCESS', '', {
		path: '/',
		maxAge: 0,
		sameSite: 'strict',
		secure: true,
		httpOnly: true,
		signed:true
	});
}

