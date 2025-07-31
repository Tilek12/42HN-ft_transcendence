import { Player } from '../engine/types';
import { GameRoom } from '../engine/game-room';
import { findProfileById, incrementWinsOrLossesOrTrophies } from '../../database/user';
import { createTournamentDB, joinTournamentDB } from '../../database/tournament';

export type TournamentSize = 4 | 8;
export type TournamentStatus = 'waiting' | 'active' | 'finished';

interface Tournament {
  id: string;
  size: TournamentSize;
  players: Player[];
  hostId: string,
  status: TournamentStatus;
  rounds: GameRoom[][]; // Each round contains a list of matches
}

let tournaments: Tournament[] = [];
let nextId = 1;

async function createTournament(size: TournamentSize, hostId: string): Promise<Tournament> {
  const tournament: Tournament = {
    id: `t-${nextId++}`,
    size,
    players: [],
    hostId,
    status: 'waiting',
    rounds: []
  };
  tournaments.push(tournament);
  // 🔥 Add DB insert
  await createTournamentDB(`Tournament ${tournament.id}`, parseInt(hostId));
  return tournament;
}

function getAvailableTournaments(): Tournament[] {
  return tournaments.filter(t => t.status === 'waiting');
}

function getTournamentById(id: string): Tournament | undefined {
  return tournaments.find(t => t.id === id);
}

async function addPlayerToTournament(tournamentId: string, player: Player) {
  const tournament = getTournamentById(tournamentId);
  if (!tournament || tournament.status !== 'waiting') return;

  if (!tournament.players.find(p => p.id === player.id)) {
    tournament.players.push(player);
  }
  // 🔥 Save to DB
  await joinTournamentDB(parseInt(tournament.id.split('-')[1]), parseInt(player.id));

  if (tournament.players.length >= tournament.size) {
    startTournament(tournament);
  }
}

async function joinTournament(player: Player, size: TournamentSize): Promise<Tournament> {
  let tournament = tournaments.find(t => t.status === 'waiting' && t.size === size && t.players.length < size);

  if (!tournament) {
    tournament = await createTournament(size, player.id);
  }

  if (!tournament.players.find(p => p.id === player.id)) {
    tournament.players.push(player);
  }
  // 🔥 Save to DB
  await joinTournamentDB(parseInt(tournament.id.split('-')[1]), parseInt(player.id));

  if (tournament.players.length === tournament.size) {
    startTournament(tournament);
  }

  return tournament;
}

function startTournament(tournament: Tournament) {
  tournament.status = 'active';
  const roundMatches: GameRoom[] = [];

  for (let i = 0; i < tournament.players.length; i += 2) {
    const p1 = tournament.players[i];
    const p2 = tournament.players[i + 1];
    const gameRoom = new GameRoom(p1, p2, tournament.id);
    roundMatches.push(gameRoom);
  }

  tournament.rounds.push(roundMatches);
}

function advanceTournament(tournamentId: string, winner: Player) {
  const tournament = getTournamentById(tournamentId);
  if (!tournament || tournament.status !== 'active') return;

  const lastRound = tournament.rounds[tournament.rounds.length - 1];
  const winners = lastRound
    .map(r => r.getWinner())
    .filter(w => w !== null) as Player[];

  if (winners.length === 1) 
  {
		(async() => 
		{
			await incrementWinsOrLossesOrTrophies(parseInt(winners[0].id), 'trophies');
		})();
		tournament.status = 'finished';
		// TODO: store tournament history later
		return;
  }

  const newRound: GameRoom[] = [];
  for (let i = 0; i < winners.length; i += 2) {
    const gameRoom = new GameRoom(winners[i], winners[i + 1], tournamentId);
    newRound.push(gameRoom);
  }
  tournament.rounds.push(newRound);
}

function getSafeTournamentData() {
  return tournaments
    .filter(t => t.status === 'waiting')
    .map(t => ({
      id: t.id,
      size: t.size,
      joined: t.players.length,
      hostId: t.hostId,
      status: t.status
    }));
}

export {
  joinTournament,
  getAvailableTournaments,
  getTournamentById,
  addPlayerToTournament,
  advanceTournament,
  getSafeTournamentData,
  Tournament
};
