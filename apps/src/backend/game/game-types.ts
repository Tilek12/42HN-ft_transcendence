export interface Player {
	id: string;
	name: string;
	socket: WebSocket;
}

export const GhostPlayer: Player = {
	id: 'ghost',
	name: '__ghost',
	socket: {
	  send() {},
	  close() {},
	  readyState: 0
	} as unknown as WebSocket
};

export interface GameState {
	ball: { x: number; y: number; vx: number; vy: number };
	paddles: { [id: string]: number }; // Y position
	score: { [id: string]: number };
	width: number;
	height: number;
	status: 'playing' | 'ended';
}

export interface MoveMessage {
	type: 'move';
	direction: 'up' | 'down';
	side?: 'left' | 'right'; // ← optional, used in solo mode
}

export type GameMode = 'solo' | 'duel' | 'match' | 'local';

export type GameMessage =
	| { type: 'move'; direction: 'up' | 'down'; side?: 'left' | 'right' }
	| { type: 'quit' }
	| { type: 'pong' }
	| { type: 'countdown'; value: number }
	| { type: 'start' }
	| { type: 'update'; state: GameState }
	| { type: 'end'; winner: { id: string; name: string }; loser: { id: string; name: string } };

export type OnGameEnd = (
	winner: Player,
	loser: Player,
	winnerScore: number,
	loserScore: number
) => void;
