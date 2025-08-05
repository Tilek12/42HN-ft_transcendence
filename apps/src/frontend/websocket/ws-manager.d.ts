export type GameMode = 'solo' | 'duel' | 'tournament';
interface PresenceUser {
    id: string;
    name?: string;
}
type PresenceCallback = (users: number, tournaments: any[]) => void;
declare class WebSocketManager {
    private gameSocket;
    private presenceSocket;
    private tournamentSocket;
    private readonly backendUrl;
    private MAX_RETRY;
    private retryAttempts;
    private reconnectTimeout;
    private activeUserCount;
    private activeTournaments;
    private presenceUsers;
    private presenceListeners;
    constructor();
    createGameSocket(mode: GameMode, size?: 4 | 8, id?: string): WebSocket | null;
    disconnectGameSocket(): void;
    connectPresenceSocket(onUpdate?: (msg: any) => void): void;
    disconnectPresenceSocket(): void;
    subscribeToPresence(cb: PresenceCallback): () => void;
    clearPresenceData(): void;
    private notifyPresenceListeners;
    connectTournamentSocket(action: 'join' | 'create', size: 4 | 8, id?: string, onMessage?: (msg: any) => void): WebSocket | null;
    disconnectTournamentSocket(): void;
    quitTournament(): void;
    get gameWS(): WebSocket | null;
    get presenceWS(): WebSocket | null;
    get tournamentWS(): WebSocket | null;
    get onlineUserCount(): number;
    get presenceUserList(): PresenceUser[];
    get onlineTournaments(): any[];
    disconnectAllSockets(): void;
}
export declare const wsManager: WebSocketManager;
export {};
//# sourceMappingURL=ws-manager.d.ts.map