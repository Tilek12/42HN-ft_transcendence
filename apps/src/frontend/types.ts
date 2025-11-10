// FRONTEND TYPES ARE DEFINED HERE



// WEBSOCKET 
export type GameMode = 'solo' | 'duel' | 'tournament';

export interface PresenceUser {
  id: string;
  name?: string;
}

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
