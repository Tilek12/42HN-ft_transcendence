// BACKEND TYPES DEFINED HERE


// USER
export interface User {
	id: number;
	name: string;
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
export type JWTPayload = {
	id: number,
	username: string,
	tfa: boolean,
	role: string,
	type: string,
};



