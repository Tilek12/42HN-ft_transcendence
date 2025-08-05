import { Player } from './types';
import { GameRoom } from './game-room';
import { userManager } from '../../user/user-manager';

export function startGame(player: Player, mode: 'solo' | 'duel') {
  if (mode === 'solo') {
    new GameRoom(player, null);
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
    new GameRoom(p1, p2);
  }
}

export function cancelDuelSearch(userId: string) {
  if (userManager.getWaitingDuel().has(userId)) {
    userManager.removeWaitingDuelPlayer(userId);
    console.log(`🛑 [Matchmaking] Removed ${userId} from duel queue`);
  }
}
