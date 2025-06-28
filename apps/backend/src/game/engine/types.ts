export type PlayerID = string;

export interface Player {
  id: PlayerID;
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

