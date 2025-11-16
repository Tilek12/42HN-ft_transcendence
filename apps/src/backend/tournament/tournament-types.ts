export type TournamentMode = 'local' | 'online';
export type TournamentSize = 4 | 8;
export type TournamentStatus = 'waiting' | 'active' | 'finished';

export type MatchStatus = 'scheduled' | 'waiting_for_sockets' | 'running' | 'finished';

export interface Participant { id: string; name: string; } // online: userId; local: ephemeral id

export interface Match {
	id: string;
	roundIndex: number;
	p1: Participant;
	p2: Participant;
	status: MatchStatus;
	gameId?: string;				// set after game is created
	winnerId?: string;
	loserId?: string;
	winnerScore?: number;
	loserScore?: number;
}

export interface TournamentState {
	id: string;
	mode: TournamentMode;			// 'local' or 'online'
	size: TournamentSize;
	hostId: string;					// creator
	status: TournamentStatus;
	participants: Participant[];	// length = size
	rounds: Match[][];				// rounds[0] = quarter/semi etc
	createdAt: number;
}

// Tournament WebSocket Message Types (Backend)
export type TournamentMessage =
  | TournamentJoinedMessage
  | TournamentLeftMessage
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
  state: TournamentState;  // Existing TournamentState interface
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

// Error message
export interface ErrorMessage {
  type: 'error';
  message: string;
}
