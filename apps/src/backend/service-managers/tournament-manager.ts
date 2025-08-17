import { WebSocket } from 'ws';
import { Player } from '../game/game-types';
import { GameRoom } from '../game/game-room';
import { userManager } from './user-manager';
import { gameManager } from './game-manager';
import {
  TournamentState,
  TournamentMode,
  TournamentSize,
  TournamentStatus,
  Participant,
  Match
} from '../tournament/tournament-types';
import { sendTournamentUpdate } from '../routes/ws/presence';
import { incrementWinsOrLossesOrTrophies } from '../database/user';
import { createTournamentDB, joinTournamentDB } from '../database/tournament';

class TournamentManager {
  private tournaments = new Map<string, TournamentState>();
  private nextTid = 1;
  private nextMid = 1;

  // For LOCAL tournaments we need to know the controlling socket for matches
  // (the creator’s computer). Keyed by tournamentId.
  private localControlSocket = new Map<string, WebSocket>();

  createTournament(mode: TournamentMode, host: Participant, size: TournamentSize, localCtrlSocket?: WebSocket) {
    const id = `t-${this.nextTid++}`;
    const tournament: TournamentState = {
      id, mode, size,
      hostId: host.id,
      status: 'waiting',
      participants: [host],
      rounds: [],
      createdAt: Date.now()
    };
    this.tournaments.set(id, tournament);

    if (mode === 'local' && localCtrlSocket) {
      this.localControlSocket.set(id, localCtrlSocket);
    }

    void createTournamentDB(`Tournament ${id}`, parseInt(host.id));
    console.log(`🏆 [Tournament: ${tournament.id}] Created`);
    sendTournamentUpdate();
    return tournament;
  }

  joinTournament(tournamentId: string, p: Participant) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament || tournament.status !== 'waiting') return null;
    if (tournament.participants.find(x => x.id === p.id)) return tournament; // already joined
    if (tournament.participants.length >= tournament.size) return null;

    tournament.participants.push(p);
    if (tournament.mode === 'online') {
      void joinTournamentDB(parseInt(tournament.id.split('-')[1]), parseInt(p.id));
    }

    sendTournamentUpdate();
    console.log(`🏆 [Tournament: ${tournamentId}] Player joined: ${p.id}`);

    if (tournament.participants.length === tournament.size) this.startTournament(tournament.id);

    return tournament;
  }

  /** Create the bracket and schedule round 1 */
  private startTournament(tournamentId: string) {
    const t = this.tournaments.get(tournamentId);
    if (!t) return;

    t.status = 'active';

    // Seed + pair
    const seeded = this.shuffle([...t.participants]); // or deterministic seeding
    const round0 = [];
    for (let i = 0; i < seeded.length; i += 2) {
      round0.push(this.makeMatch(t, 0, seeded[i], seeded[i+1]));
    }
    t.rounds.push(round0);

    // Start matches based on kind
    if (t.mode === 'online') this.startRoundSimultaneously(t, 0);
    else this.startRoundSequentially(t, 0);

    console.log(`🏆 [Tournament: ${t.id}] Started`);
    sendTournamentUpdate();
  }

  /** Called by GameManager when one game ends */
  onMatchEnd(tournamentId: string, matchId: string, winner: Participant, loser: Participant, ws: number, ls: number) {
    const t = this.tournaments.get(tournamentId);
    if (!t) return;
    const match = this.findMatch(t, matchId);
    if (!match) return;

    match.status = 'finished';
    match.winnerId = winner.id;
    match.loserId = loser.id;
    match.winnerScore = ws;
    match.loserScore = ls;

    // Trophy on tournament end will be handled when we detect final winner

    // If all matches in this round finished, build next round or finish
    const round = t.rounds[match.roundIndex];
    if (round.every(m => m.status === 'finished')) {
      const winners = round.map(m => t.participants.find(p => p.id === m.winnerId)!).filter(Boolean);

      if (winners.length === 1) {
        // tournament finished
        t.status = 'finished';
        void incrementWinsOrLossesOrTrophies(parseInt(winners[0].id), 'trophies');
        this.broadcastTournamentUpdate(t.id);
        return;
      }

      // Next round
      const nextIdx = match.roundIndex + 1;
      const nextRound: Match[] = [];
      for (let i = 0; i < winners.length; i += 2) {
        nextRound.push(this.makeMatch(t, nextIdx, winners[i], winners[i+1]));
      }
      t.rounds.push(nextRound);

      if (t.mode === 'online') this.startRoundSimultaneously(t, nextIdx);
      else this.startRoundSequentially(t, nextIdx);
    }

    this.broadcastTournamentUpdate(t.id);
  }

  /** Local tournaments: start matches one-by-one on the same computer */
  private async startRoundSequentially(t: TournamentState, roundIdx: number) {
    const ctrlSocket = this.localControlSocket.get(t.id);
    for (const m of t.rounds[roundIdx]) {
      await this.startOneMatch(t, m, ctrlSocket); // await: resolves when game ends
    }
  }

  /** Online tournaments: start whole round in parallel */
  private startRoundSimultaneously(t: TournamentState, roundIdx: number) {
    for (const m of t.rounds[roundIdx]) this.startOneMatch(t, m);
  }

  /** Start one match, wire onEnd → TournamentManager.onMatchEnded */
  private startOneMatch(t: TournamentState, match: Match, localSocket?: WebSocket) {
    match.status = 'running';

    const toPlayer = (p: Participant) => {
      // Online: use each user's game socket from userManager
      // Local: both players share the same localSocket
      if (t.mode === 'local' && localSocket) {
        return { id: p.id, name: p.name, socket: localSocket } as Player;
      }
      const u = userManager.getUser(p.id);
      if (!u?.gameSocket) {
        // you may want to notify missing connection; here we fall back to a ghost socket to avoid crash
        return { id: p.id, name: p.name, socket: (u?.gameSocket as any) } as Player;
      }
      return { id: p.id, name: p.name, socket: u.gameSocket } as Player;
    };

    const p1 = toPlayer(match.p1);
    const p2 = toPlayer(match.p2);

    const game = gameManager.createGame(
      p1,
      p2,
      t.id,
      match.id,
      { mode: t.mode === 'local' ? 'local' : 'duel' }
    );

    match.gameId = game.id;

    // Return a promise for local sequential flow
    if (t.mode === 'local') {
      return new Promise<void>((resolve) => {
        game.onEndCallback((winner, loser, ws, ls) => {
          this.onMatchEnd(t.id, match.id, { id: winner.id, name: winner.name }, { id: loser.id, name: loser.name }, ws, ls);
          resolve();
        });
      });
    }
  }

  private makeMatch(t: TournamentState, roundIdx: number, p1: Participant, p2: Participant): Match {
    return {
      id: `m-${this.nextMid++}`,
      roundIndex: roundIdx,
      p1, p2,
      status: 'scheduled'
    };
    // (Persist: create match row linked to tournamentId)
  }

  private findMatch(t: TournamentState, matchId: string) {
    for (const r of t.rounds) {
      const m = r.find(x => x.id === matchId);
      if (m) return m;
    }
    return undefined;
  }

  private shuffle<T>(arr: T[]) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /** push updates to UIs (tournament lobby + participants) */
  private broadcastTournamentUpdate(tournamentId: string) {
    // Use presence/tournament sockets to fan this out
    // e.g., send {type:'tournamentUpdate', state: safeState } to all players in this tournament
  }

  getSafeState(id: string) {
    const t = this.tournaments.get(id);
    if (!t) return null;
    return {
      id: t.id, kind: t.mode, size: t.size,
      status: t.status, hostId: t.hostId,
      participants: t.participants.map(p => ({ id: p.id, name: p.name })),
      rounds: t.rounds.map(r => r.map(m => ({
        id: m.id, status: m.status, p1: m.p1.id, p2: m.p2.id, winnerId: m.winnerId
      })))
    };
  }

  getSafeTournamentData() {
    return Array.from(this.tournaments.values()).map(t => ({
      id: t.id,
      size: t.size,
      joined: t.participants.length,
      hostId: t.hostId,
      status: t.status,
      playerIds: t.participants.map(p => p.id)
    }));
  }

  quitTournament(userId: string) {
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
}

export const tournamentManager = new TournamentManager();
