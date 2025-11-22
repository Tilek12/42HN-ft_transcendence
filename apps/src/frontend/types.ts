// FRONTEND TYPES ARE DEFINED HERE



// WEBSOCKET 
export type GameMode = 'solo' | 'duel' | 'tournament';

export interface PresenceUser {
  id: string;
  name?: string;
}

export interface User {
  id:number;
  username:   string,
  created_at: string,
  image_blob:string | undefined;
  wins:number,
  losses:number,
  trophies:number,
}

export type Match =
	{
		id: number,
		player1_id: number,
		player2_id: number,
		player1_score: number,
		player2_score: number,
		winner_id: number,
		is_tie: boolean,
		is_tournament_match: boolean,
		played_at: string,
		player1_username: string,
		player2_username: string,
		total_matches?: number,
		win_rate?: number,
	};

export type PresenceCallback = (users: number, tournaments: any[]) => void;

// FRIENDS 

//friend type not implemented, on fritends.ts used as `let allFriends: {friends : any[]}[] | undefined= [];`

// let lastPresence : any[] | undefined = [];
// let all_profiles_length : number |undefined = 0; renderProfiles.ts

// LANGUAGES
export type Language = 'EN' | 'DE' | 'GR';
export type TranslationSet = Record<Language, { [key: string]: string }>;

export interface PlaceholderElement extends HTMLElement {
	placeholder:string
}

export type payload = {
  id: number,
  username: string,
  tfa: boolean,
  role: string,
  type: string,
}


