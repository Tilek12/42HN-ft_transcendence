export type PlayerID = string;

export interface Player {
logged_in: boolean;
  id: PlayerID;
  wins: number;
  losses: number;
  trophies: number;
  socket: WebSocket;
}

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

export type GameMode = 'solo' | 'duel' | 'tournament';

export interface Tournament {
  id: string;
  players: Player[];
  size: number; // 4 or 8
  matches: { p1: Player; p2: Player | null }[];
  started: boolean;
}
