export type PlayerID = string;

export interface Player {
  id: PlayerID;
  socket: WebSocket;
}

export interface GameState {
  ball: { x: number; y: number; vx: number; vy: number };
  paddles: { [id: PlayerID]: {
	side: 'left' | 'right' | 'top' | 'bottom';
	pos: number;
   };
  }; // Y position
  score: { [id: string]: number };
  width: number;
  height: number;
  status: 'playing' | 'ended';
}

export interface MoveMessage {
  type: 'move';
  direction: 'up' | 'down' | 'left' | 'right';
  side: 'left' | 'right' | 'top' | 'bottom'; // ← optional, used in solo mode
}

export type GameMode = 'solo' | 'duel' | 'four';
