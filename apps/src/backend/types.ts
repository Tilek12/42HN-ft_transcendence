import WebSocket from 'ws'


// BACKEND TYPES DEFINED HERE


// USER
export interface User {
	// auth info
	id: number;
	username:string, //only there until tilek changes all his 'name' uses to 'username'
	name: string;
	is_logged_in: boolean;
	tfa:boolean,
	tfa_secret:string,
	role:string,
	email:string,
	password:string,
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
  tmp =     "tmp",
  normal =  "normal",
  persist = "persist" ,
}

export type JWTPayload = {
	id: number,
	username: string,
	tfa: boolean,
	role: string,
	type: Jwt_type,
};



