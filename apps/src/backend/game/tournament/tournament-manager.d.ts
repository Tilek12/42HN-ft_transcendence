import { Player } from '../engine/types';
import { GameRoom } from '../engine/game-room';
export type TournamentSize = 4 | 8;
export type TournamentStatus = 'waiting' | 'active' | 'finished';
interface Tournament {
    id: string;
    size: TournamentSize;
    players: Player[];
    hostId: string;
    status: TournamentStatus;
    rounds: GameRoom[][];
}
declare function getUserTournament(userId: string): Tournament | undefined;
declare function createTournament(player: Player, size: TournamentSize): Tournament | null;
declare function joinTournament(player: Player, tournamentId: string): Tournament | null;
declare function advanceTournament(tournamentId: string, winner: Player): void;
declare function getSafeTournamentData(): {
    id: string;
    size: TournamentSize;
    joined: number;
    hostId: string;
    status: TournamentStatus;
    playerIds: string[];
}[];
declare function quitTournament(userId: string): void;
export { Tournament, createTournament, joinTournament, getSafeTournamentData, getUserTournament, advanceTournament, quitTournament };
//# sourceMappingURL=tournament-manager.d.ts.map