export interface Player {
  profile_pic?: string;
  logged_in?: boolean;
  id: string;
  name?: string;
  wins?: number;
  losses?: number;
  trophies?: number;
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
