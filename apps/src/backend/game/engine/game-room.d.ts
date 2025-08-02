import { Player } from './types';
export declare class GameRoom {
    private players;
    private mode;
    private tournamentId?;
    private state;
    private interval;
    private winner;
    constructor(player1: Player, player2: Player | null, tournamentId?: string);
    private initState;
    private setupListeners;
    private move;
    private startCountdown;
    private start;
    private updateGame;
    private resetBall;
    private broadcast;
    getWinner(): Player | null;
    getLoser(): Player | null;
    private end;
}
//# sourceMappingURL=game-room.d.ts.map