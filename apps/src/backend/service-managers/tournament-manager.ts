import { Player } from '../game/types';
import { GameRoom } from '../game/game-room';
import { sendTournamentUpdate } from '../routes/ws/presence';
// import { tournamentSockets } from '../../websocket/tournament'
// import { incrementWinsOrLossesOrTrophies } from '../database/user';
// import { findProfileById } from '../database/profile';
import { createTournamentDB, joinTournamentDB } from '../database/tournament';

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

interface MatchStartNotification {
  type: 'matchStart';
  tournamentId: string;
  matchId: string;
  player1: string;
  player2: string;
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

async function createTournament(player: Player, size: TournamentSize): Promise<Tournament | null> {
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
  sendTournamentUpdate();
  // 🔥 Add DB insert
  await createTournamentDB(`Tournament ${tournament.id}`, parseInt(tournament.hostId));
  return tournament;
}

async function joinTournament(player: Player, tournamentId: string): Promise<Tournament | null> {
  if (getUserTournament(player.id)) return null;

  const tournament = getTournamentById(tournamentId);
  if (!tournament || tournament.status !== 'waiting' || tournament.players.length >= tournament.size) {
    return null;
  }

  tournament.players.push(player);
  sendTournamentUpdate();

  // 🔥 Save to DB
  await joinTournamentDB(parseInt(tournament.id.split('-')[1]), parseInt(player.id));

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
    const game = new GameRoom(p1, p2, t.id);
    round.push(game);

    // 🔔 Notify both players to redirect to match view
    notifyMatchStart(t.id, p1.id, p2.id);

    // DB //
    // TODO: Save match start to DB (with p1.id, p2.id, t.id, timestamp)
    ////////
  }

  t.rounds.push(round);
  console.log(`🏆 [Tournament: ${t.id}] Started`);
  sendTournamentUpdate();
}

function advanceTournament(tournamentId: string, winner: Player) {
  const t = getTournamentById(tournamentId);
  if (!t || t.status !== 'active') return;

  const lastRound = t.rounds[t.rounds.length - 1];
  const winners = lastRound.map(g => g.getWinner()).filter(Boolean) as Player[];

  // 🔖 TODO: Save each game's result to DB
  // for (const game of lastRound) {
  //   const w = game.getWinner();
  //   const l = game.getLoser?.();
  //   if (w && l) {
  //     // Example: await saveMatchResultToDB(w.id, l.id, t.id, game.getId());
  //   }
  // }

  if (winners.length === 1) {
    (async() =>
      {
        await incrementWinsOrLossesOrTrophies(parseInt(winners[0]!.id), 'trophies');
      })();
    t.status = 'finished';

    // 🔖 TODO: Save tournament result to DB: t.id, winner.id, etc.
    // Example: await saveTournamentResult(t.id, winners[0].id);

    console.log(`🏁 [Tournament: ${t.id}] Finished! Winner: ${winners[0]!.id}`);
    sendTournamentUpdate();
    return;
  }

  const newRound: GameRoom[] = [];
  for (let i = 0; i < winners.length; i += 2) {
    const p1 = winners[i];
    const p2 = winners[i + 1] || null;
    const game = new GameRoom(p1, p2, tournamentId);
    newRound.push(game);

    if (p2) notifyMatchStart(t.id, p1.id, p2.id);

    // DB //
    // TODO: Save new match start to DB
    ////////
  }

  t.rounds.push(newRound);
  sendTournamentUpdate();
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

  sendTournamentUpdate();
}

// Helper to notify players
function notifyMatchStart(tournamentId: string, player1Id: string, player2Id: string) {
  const payload: MatchStartNotification = {
    type: 'matchStart',
    tournamentId,
    matchId: `m-${Date.now()}`, // optionally match IDs could be tracked in state
    player1: player1Id,
    player2: player2Id
  };

  // for (const id of [player1Id, player2Id]) {
  //   const ws = tournamentSockets.get(id);
  //   if (ws && ws.readyState === ws.OPEN) {
  //     ws.send(JSON.stringify(payload));
  //   }
  // }/
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
