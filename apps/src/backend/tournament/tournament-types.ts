export type TournamentMode = 'local' | 'online';
export type TournamentSize = 4 | 8;
export type TournamentStatus = 'waiting' | 'active' | 'finished';

export type MatchStatus = 'scheduled' | 'running' | 'finished';

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
