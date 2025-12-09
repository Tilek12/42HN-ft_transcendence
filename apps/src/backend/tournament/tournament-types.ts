export type TournamentMode = 'local' | 'online';
export type TournamentSize = 4 | 8;
export type TournamentStatus = 'waiting' | 'active' | 'finished';

export type MatchStatus = 'scheduled' | 'waiting_for_sockets' | 'running' | 'finished';

export interface Participant { id: number; name: string; }

export interface Match {
	id: number;
	roundIndex: number;
	p1: Participant;
	p2: Participant;
	status: MatchStatus;
	gameId?: number;				// set after game is created
	winnerId?: number;
	loserId?: number;
	winnerScore?: number;
	loserScore?: number;
}

export interface TournamentState {
	id: number;
	size: TournamentSize;
	hostId: number;					// creator's id
  // hostSocket: WebSocket;	// creator's control socket
	status: TournamentStatus;
	participants: Participant[];	// length = size
	rounds: Match[][];				// rounds[0] = quarter/semi etc
	createdAt?: number;
}

// Tournament WebSocket Message Types (Backend)
export type TournamentMessage =
  | JoinOnlineTournamentMessage
  | CreateOnlineTournamentMessage
  | OnlineTournamentLeftMessage
  | LocalTournamentLeftMessage
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
  id: number;  // User ID or local ephemeral ID
  name: string;
}

// Create ONLINE Tournament with participants
export interface CreateOnlineTournamentMessage {
  type: 'createOnlineTournament';
  size: 4 | 8;
  participants: TournamentParticipant[];
}

// Join ONLINE Tournament joined confirmation
export interface JoinOnlineTournamentMessage {
  type: 'onlineTournamentJoined';
  id: number;  // Tournament ID
}

// Create LOCAL Tournament with participants
export interface CreateLocalTournamentMessage {
  type: 'createLocalTournament';
  size: 4 | 8;
  participants: TournamentParticipant[];
}

// User left ONLINE tournament
export interface OnlineTournamentLeftMessage {
  type: 'onlineTournamentLeft';
}

// User left LOCAL tournament
export interface LocalTournamentLeftMessage {
  type: 'localTournamentLeft';
}

// Match starting (unified for local/online)
export interface MatchStartMessage {
  type: 'matchStart';
  tournamentId: number;
  matchId: number;
  size: 4 | 8;  // Tournament size
  participants: [TournamentParticipant, TournamentParticipant];  // Always objects, not IDs
}

// Match ended
export interface MatchEndMessage {
  type: 'matchEnd';
  tournamentId: number;
  matchId: number;
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
  state: TournamentState;  // Existing TournamentState interface
}

// Player signals readiness for match
export interface PlayerReadyMessage {
  type: 'playerReady';
  tournamentId: number;
  matchId: number;
}

// User quits tournament
export interface QuitTournamentMessage {
  type: 'quitTournament';
}

// Error message
export interface ErrorMessage {
  type: 'error';
  message: string;
}
