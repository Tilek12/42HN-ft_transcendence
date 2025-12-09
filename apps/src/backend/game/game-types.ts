
import  WebSocket from 'ws';

export type Player =
	| {
		id: number;
		name: string;
		socket: WebSocket;
		isGhost?: false;
	}
	| {
		id: -1;
		name: '__ghost';
		socket: null;
		isGhost: true;
	};

export const GhostPlayer: Player = {
	id: -1,
	name: '__ghost',
	socket: null,
	isGhost: true,
};

export interface GameState {
	ball: { x: number; y: number; vx: number; vy: number };
	paddles: { [id: number]: number }; // Y position
	score: { [id: number]: number };
	width: number;
	height: number;
	status: 'playing' | 'ended';
	playerNames: { [id: number]: string };
}

export interface MoveMessage {
	type: 'move';
	direction: 'up' | 'down';
	side?: 'left' | 'right'; // ← optional, used in solo mode
}

export type GameMode = 'solo' | 'duel' | 'online-match' | 'local-match';

export type GameMessage =
	| { type: 'move'; direction: 'up' | 'down'; side?: 'left' | 'right' }
	| { type: 'quit' }
	| { type: 'pong' }
	| { type: 'countdown'; value: number }
	| { type: 'start' }
	| { type: 'update'; state: GameState }
	| { type: 'end'; winner: { id: number; name: string }; loser: { id: number; name: string } };

export type OnGameEnd = (
	winner: Player,
	loser: Player,
	winnerScore: number,
	loserScore: number
) => void;
