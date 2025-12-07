// FRONTEND TYPES ARE DEFINED HERE



// WEBSOCKET
export type GameMode = 'solo' | 'duel' | 'tournament';

export interface PresenceUser {
  id: string;
  name?: string;
}


// fUser = Frontend User (to not get confused)
export interface fUser extends fProfile {
  tfa:boolean,
}
//frontend profile
export type fProfile = {
	id:number
	username: string,
	created_at:string,
	wins: string,
	losses: string,
	trophies: string,
	image_blob: string | undefined,
};

export type fProfileListEntry = fProfile & {
  friendrequest: 'received' | 'sent' | null,
  iBlock:boolean;
  blocksMe:boolean;
}


export type fProfileList =
	{
		profiles: fProfileListEntry[],
		limit: number,
		offset: number,
		already_parsed: boolean | undefined
	};


// frontend match
export type fMatch = {
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

// frontend matchHistory
export type fMatchHistory = {
	matches: fMatch[],
	wins: number,
	total: number,
	win_rate: number,
  tournament_games:number,
  }

// frontend fMatchForSummary
export type fMatchForSummary = {
	matchID:number,
	player1_username:string,
	player2_username:string,
	player1_score:number,
	player2_score:number,
	winner_username:string,
	is_tournament_match:boolean,
	played_at: string,
}

// frontend fMatchSummary
export type fMatchSummary = {
	matchesForSummary: fMatchForSummary[],
}

// frontend fPlayer
export type fPlayer = {
  username: string,
  wins:number,
  losses:number,
  total_match:number,
  total_score:number,
  tournament_games: number,
  tournament_games_won:number,
  win_rate:number,
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


// Tournament WebSocket Message Types (Frontend) - Copied from backend for consistency
export type TournamentMessage =
  | TournamentJoinedMessage
  | TournamentLeftMessage
  | CreateLocalTournamentMessage
  | MatchStartMessage
  | MatchEndMessage
  | TournamentEndMessage
  | TournamentUpdateMessage
  | PlayerReadyMessage
  | QuitTournamentMessage
  | ErrorMessage;

// Base participant structure (consistent for local/online)
export interface TournamentParticipant {
  id: string;  // User ID or local ephemeral ID
  name: string;
}

// Tournament joined confirmation
export interface TournamentJoinedMessage {
  type: 'tournamentJoined';
  id: string;  // Tournament ID
}

// User left tournament
export interface TournamentLeftMessage {
  type: 'tournamentLeft';
}

// Match starting (unified for local/online)
export interface MatchStartMessage {
  type: 'matchStart';
  tournamentId: string;
  matchId: string;
  size: 4 | 8;  // Tournament size
  participants: [TournamentParticipant, TournamentParticipant];  // Always objects, not IDs
}

// Match ended
export interface MatchEndMessage {
  type: 'matchEnd';
  tournamentId: string;
  matchId: string;
  winner: TournamentParticipant;
  loser: TournamentParticipant;
}

// Tournament finished
export interface TournamentEndMessage {
  type: 'tournamentEnd';
  winner: TournamentParticipant;
}

// Tournament state update (for lobby/UI)
export interface TournamentUpdateMessage {
  type: 'tournamentUpdate';
  state: any;  // TournamentState interface (avoid cross-imports; use any for now)
}

// Player signals readiness for match
export interface PlayerReadyMessage {
  type: 'playerReady';
  tournamentId: string;
  matchId: string;
}

// User quits tournament
export interface QuitTournamentMessage {
  type: 'quitTournament';
}

// Create local tournament with participants
export interface CreateLocalTournamentMessage {
  type: 'createLocalTournament';
  size: 4 | 8;
  participants: TournamentParticipant[];
}

// Error message
export interface ErrorMessage {
  type: 'error';
  message: string;
}
