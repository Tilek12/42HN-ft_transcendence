
import  WebSocket from 'ws';

export type Player =
	| {
		id: string;
		name: string;
		socket: WebSocket;
		isGhost?: false;
	}
	| {
		id: '__ghost';
		name: '__ghost';
		socket: null;
		isGhost: true;
	};

export const GhostPlayer: Player = {
	id: '__ghost',
	name: '__ghost',
	socket: null,
	isGhost: true,
};

export interface GameState {
	ball: { x: number; y: number; vx: number; vy: number };
	paddles: { [id: string]: number }; // Y position
	score: { [id: string]: number };
	width: number;
	height: number;
	status: 'playing' | 'ended';
	playerNames: { [id: string]: string };
	playerRoles?: { left: string; right: string };
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
	| { type: 'end'; winner: { id: string; name: string }; loser: { id: string; name: string } };

export type OnGameEnd = (
	winner: Player,
	loser: Player,
	winnerScore: number,
	loserScore: number
) => void;
