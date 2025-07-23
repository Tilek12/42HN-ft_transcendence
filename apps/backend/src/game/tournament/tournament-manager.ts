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

let tournaments: Tournament[] = [];
let nextId = 1;

function getTournamentById(id: string) {
  return tournaments.find(t => t.id === id);
}

function getUserTournament(userId: string): Tournament | undefined {
  return tournaments.find(t =>
    t.status === 'waiting' && t.players.some(p => p.id === userId)
  );
}

function joinOrCreateTournament(player: Player, size: TournamentSize): Tournament | null {
  const existing = getUserTournament(player.id);
  if (existing) return existing;

  let tournament = tournaments.find(t => t.status === 'waiting' && t.size === size && t.players.length < size);

  if (!tournament) {
    tournament = {
      id: `t-${nextId++}`,
      size,
      players: [],
      hostId: player.id,
      status: 'waiting',
      rounds: []
    };
    tournaments.push(tournament);
  }

  tournament.players.push(player);

  if (tournament.players.length === tournament.size) {
    startTournament(tournament);
  }

  return tournament;
}

function startTournament(t: Tournament) {
  t.status = 'active';
  const round: GameRoom[] = [];

  for (let i = 0; i < t.players.length; i += 2) {
    const p1 = t.players[i];
    const p2 = t.players[i + 1];
    round.push(new GameRoom(p1, p2, t.id));
  }

  t.rounds.push(round);
}

function advanceTournament(tournamentId: string, winner: Player) {
  const t = getTournamentById(tournamentId);
  if (!t || t.status !== 'active') return;

  const lastRound = t.rounds[t.rounds.length - 1];
  const winners = lastRound.map(g => g.getWinner()).filter(Boolean) as Player[];

  if (winners.length === 1) {
    t.status = 'finished';
    return;
  }

  const newRound: GameRoom[] = [];
  for (let i = 0; i < winners.length; i += 2) {
    newRound.push(new GameRoom(winners[i], winners[i + 1], tournamentId));
  }

  t.rounds.push(newRound);
}

function getSafeTournamentData() {
  return tournaments
    .filter(t => t.status === 'waiting')
    .map(t => ({
      id: t.id,
      size: t.size,
      joined: t.players.length,
      hostId: t.hostId,
      playerIds: t.players.map(p => p.id),
      status: t.status
    }));
}

export {
  Tournament,
  joinOrCreateTournament,
  getSafeTournamentData,
  getUserTournament,
  advanceTournament
};
