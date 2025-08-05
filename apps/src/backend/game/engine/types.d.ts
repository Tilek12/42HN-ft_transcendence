export interface Player {
    id: string;
    name: string;
    socket: WebSocket;
}
export interface GameState {
    ball: {
        x: number;
        y: number;
        vx: number;
        vy: number;
    };
    paddles: {
        [id: string]: number;
    };
    score: {
        [id: string]: number;
    };
    width: number;
    height: number;
    status: 'playing' | 'ended';
}
export interface MoveMessage {
    type: 'move';
    direction: 'up' | 'down';
    side?: 'left' | 'right';
}
export type GameMode = 'solo' | 'duel' | 'tournament';
//# sourceMappingURL=types.d.ts.map