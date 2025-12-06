import WebSocket from 'ws'
import type fastifyJwt from '@fastify/jwt'

// BACKEND TYPES DEFINED HERE


// USER
export interface User {
	// auth info
	id: number;
	username: string, //only there until tilek changes all his 'name' uses to 'username'
	name: string;
	is_logged_in: string;
	tfa: boolean,
	tfa_secret: string,
	role: string,
	password: string,
	created_at: string,
	//game info
	gameSocket: WebSocket | null;
	presenceSocket: WebSocket | null;
	tournamentSocket: WebSocket | null;
	tournamentId?: number;
	tournamentMatchId?: number;
	isAlive: boolean;
	isInGame: boolean;
	isInTournament: boolean;
}




// AUTH
export enum Jwt_type {
	enable = "ENABLE",
	verify = "VERIFY",
	access = "ACCESS",
	refresh = "REFRESH",
}

export type JWTPayload = {
	id: number,
	username: string,
	tfa: boolean,
	role: string,
	type: Jwt_type,
};

interface FastifyJWT {
	payload: { id: number } // payload type is used for signing and verifying
	user: JWTPayload, // user type is return type of `request.user` object
}








// database types for user management


export type Profile = {
	id:number
	username: string,
	created_at:string,
	wins: string,
	losses: string,
	trophies: string,
	image_blob: string,
};

export type ProfileListEntry = Profile & {
	friendrequest: 'received' | 'sent' | null,
	iBlock:boolean;
	blocksMe:boolean;
}


export type friendRequest = {
  sender_id:number,
  receiver_id:number,
}


export type blockStatus = {
  user_id: number,
  blocked_id: number,
}


export type match = {
	matchID:number,
	player1_username:string,
	player2_username:string,
	player1_id:number,
	player2_is:number,
	player1_score:number,
	player2_score:number,
	winner_id:number,
	is_tie:boolean,
	is_tournament_match:boolean,
	played_at: string,
}

export type matchHistory = {
	matches: match[],
	wins: number,
	total: number,
	win_rate: number,
	tournament_games:number,

}

export type matchForSummary = {
	matchID:number,
	player1_username:string,
	player2_username:string,
	player1_score:number,
	player2_score:number,
	winner_username:string,
	is_tournament_match:boolean,
	played_at: string,
}
