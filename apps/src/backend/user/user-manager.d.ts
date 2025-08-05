import { WebSocket } from 'ws';
import { Player } from '../game/engine/types';
interface User {
    id: string;
    name: string;
    gameSocket: WebSocket | null;
    presenceSocket: WebSocket | null;
    tournamentSocket: WebSocket | null;
    tournamentId?: number;
    tournamentMatchId?: number;
    isAlive: boolean;
    isInGame: boolean;
    isInTournament: boolean;
}
declare class UserManager {
    private users;
    private waitingDuel;
    getUser(id: string): User | undefined;
    createUser(id: string, name: string, presenceSocket: WebSocket): boolean;
    removeUser(id: string): void;
    setAlive(id: string, alive: boolean): void;
    setInGame(id: string, value: boolean): void;
    setInTornament(id: string, value: boolean): void;
    getOnlineUsers(): {
        id: string;
        name: string;
    }[];
    getOnlineUsersCount(): number;
    getWaitingDuel(): Map<string, Player>;
    setWaitingDuelPlayer(id: string, player: Player): void;
    removeWaitingDuelPlayer(id: string): void;
    setGameSocket(id: string, socket: WebSocket): void;
    removeGameSocket(id: string): void;
    setPresenceSocket(id: string, socket: WebSocket): void;
    removePresenceSocket(id: string): void;
    setTournamentSocket(id: string, socket: WebSocket): void;
    removeTournamentSocket(id: string): void;
    checkHeartbeats(): void;
}
export declare const userManager: UserManager;
export {};
//# sourceMappingURL=user-manager.d.ts.map