import { Player } from './types';
import { GameRoom } from './game-room';
import { userManager } from '../../user/user-manager';
import { incrementWinsOrLossesOrTrophies } from '../../database/user';
import { createMatch } from '../../database/match';

export async function startGame(player: Player, mode: 'solo' | 'duel' | 'tournament', tournamentId?: string) {
  let isGameFinished = false;

  if (mode === 'solo') {
    new GameRoom(player, null, undefined, async (winner, loser, winnerScore, loserScore) => {
      if (!isGameFinished) {
        isGameFinished = true;
        console.log('WINNER: ', winner?.name);
        console.log('LOSER: ', loser?.name);
        console.log('WINNER_SCORE: ', winnerScore);
        console.log('LOSER_SCORE: ', loserScore);
      }
    });
    return;
  }

  if (userManager.getWaitingDuel().has(player.id)) {
    console.warn(`🚫 Player ${player.id} already waiting for a duel`);
    return;
  }

  userManager.setWaitingDuelPlayer(player.id, player);
  const players = Array.from(userManager.getWaitingDuel().values());

  if (players.length >= 2) {
    const [p1, p2] = players;
    userManager.removeWaitingDuelPlayer(p1.id);
    userManager.removeWaitingDuelPlayer(p2.id);
    new GameRoom(p1, p2, undefined, async (winner, loser, winnerScore, loserScore) => {
      if (!isGameFinished) {
        isGameFinished = true;
        console.log('WINNER: ', winner?.name);
        console.log('LOSER: ', loser?.name);
        console.log('WINNER_SCORE: ', winnerScore);
        console.log('LOSER_SCORE: ', loserScore);

        //------Thomas code-------
        if (winner)
          await incrementWinsOrLossesOrTrophies(parseInt(winner.id), "wins");
        if (loser)
          await incrementWinsOrLossesOrTrophies(parseInt(loser.id), "losses");

        //------ Save to matches table -------
        const isTournamentMatch = mode === 'duel' && !!tournamentId;
        // Create Match
        await createMatch(
          parseInt(winner.id),
          parseInt(loser.id),
          winnerScore,
          loserScore,
          isTournamentMatch
        );

        // Get last inserted match ID
        //    const { id: lastMatchId } = await db.get(`SELECT last_insert_rowid() as id`);
        // Link match to tournament
        // if (isTournamentMatch && tournamentId) {
        //   await linkMatchToTournament(parseInt(tournamentId.split('-')[1]), lastMatchId);
        // }
      }
    });
  }
}

export function cancelDuelSearch(userId: string) {
  if (userManager.getWaitingDuel().has(userId)) {
    userManager.removeWaitingDuelPlayer(userId);
    console.log(`🛑 [Matchmaking] Removed ${userId} from duel queue`);
  }
}
