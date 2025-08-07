import { Player } from './types';
import { GameRoom } from './game-room';
import { userManager } from '../../user/user-manager';
import { incrementWinsOrLossesOrTrophies } from 'src/database/user';

export async function startGame(player: Player, mode: 'solo' | 'duel') {
  let isGameFinished = false;

  if (mode === 'solo') {
    new GameRoom(player, null, undefined, async (winner, loser) => {
      if (!isGameFinished) {
        isGameFinished = true;
        console.log('WINNER: ', winner?.name);
        console.log('LOSER: ', loser?.name);
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
    new GameRoom(p1, p2, undefined, async (winner, loser) => {
      if (!isGameFinished) {
        isGameFinished = true;
        console.log('WINNER: ', winner?.name);
        console.log('LOSER: ', loser?.name);
        if (winner)
          await incrementWinsOrLossesOrTrophies(parseInt(winner.id), "wins");
        if (loser)
          await incrementWinsOrLossesOrTrophies(parseInt(loser.id), "losses");
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
