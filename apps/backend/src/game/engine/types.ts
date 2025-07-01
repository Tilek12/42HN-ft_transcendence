export type PlayerID = string;

export interface Player {
  id: PlayerID;
  name: string;
  socket?: WebSocket;
  points?: number;
  winner?: boolean;
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

export type GameMode = 'solo' | 'duel';
