import { Player } from '../engine/types';
import { GameRoom } from '../engine/game-room';
import { broadcastTournaments } from '../../websocket/presence';

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

function createTournament(player: Player, size: TournamentSize): Tournament | null {
  if (getUserTournament(player.id)) return null;

  const tournament: Tournament = {
    id: `t-${nextId++}`,
    size,
    players: [player],
    hostId: player.id,
    status: 'waiting',
    rounds: []
  };

  tournaments.push(tournament);
  console.log(`🏆 [Tournament: ${tournament.id}] Created`);
  broadcastTournaments();
  return tournament;
}

function joinTournament(player: Player, tournamentId: string): Tournament | null {
  if (getUserTournament(player.id)) return null;

  const tournament = getTournamentById(tournamentId);
  if (!tournament || tournament.status !== 'waiting' || tournament.players.length >= tournament.size) {
    return null;
  }

  tournament.players.push(player);
  broadcastTournaments();

  if (tournament.players.length === tournament.size) {
    startTournament(tournament);
  }

  console.log(`🏆 [Tournament: ${tournamentId}] Player joined: ${player.id}`);
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
  console.log(`🏆 [Tournament: ${t.id}] Started`);
  broadcastTournaments();
}

function advanceTournament(tournamentId: string, winner: Player) {
  const t = getTournamentById(tournamentId);
  if (!t || t.status !== 'active') return;

  const lastRound = t.rounds[t.rounds.length - 1];
  const winners = lastRound.map(g => g.getWinner()).filter(Boolean) as Player[];

  if (winners.length === 1) {
    t.status = 'finished';
    broadcastTournaments();
    return;
  }

  const newRound: GameRoom[] = [];
  for (let i = 0; i < winners.length; i += 2) {
    const p1 = winners[i];
    const p2 = winners[i + 1] || null;
    newRound.push(new GameRoom(p1, p2, tournamentId));
  }

  t.rounds.push(newRound);
  broadcastTournaments();
}

function getSafeTournamentData() {
  return tournaments.map(t => ({
      id: t.id,
      size: t.size,
      joined: t.players.length,
      hostId: t.hostId,
      status: t.status,
      playerIds: t.players.map(p => p.id)
    }));
}

function quitTournament(userId: string) {
  const t = getUserTournament(userId);
  if (!t) return;

  t.players = t.players.filter(p => p.id !== userId);
  console.log(`❌ [Tournament: ${t.id}] Player quit: ${userId}`);

  // Remove if empty
  if (t.players.length === 0) {
    tournaments = tournaments.filter(x => x.id !== t.id);
    console.log(`🗑 [Tournament: ${t.id}] Empty tournament deleted`);
  }

  broadcastTournaments();
}

export {
  Tournament,
  createTournament,
  joinTournament,
  getSafeTournamentData,
  getUserTournament,
  advanceTournament,
  quitTournament
};
