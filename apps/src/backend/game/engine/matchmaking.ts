import { Player } from './types';
import { GameRoom } from './game-room';

const waitingDuel = new Map<string, Player>();

export function startGame(player: Player, mode: 'solo' | 'duel') {
  if (mode === 'solo') {
    new GameRoom(player, null);
    return;
  }

  if (waitingDuel.has(player.id)) {
    console.warn(`🚫 Player ${player.id} already waiting for a duel`);
    return;
  }

  waitingDuel.set(player.id, player);
  const players = Array.from(waitingDuel.values());

  if (players.length >= 2) {
    const [p1, p2] = players;
    waitingDuel.delete(p1.id);
    waitingDuel.delete(p2.id);
    new GameRoom(p1, p2);
  }
}

export function cancelDuelSearch(userId: string) {
  if (waitingDuel.has(userId)) {
    waitingDuel.delete(userId);
    console.log(`🛑 [Matchmaking] Removed ${userId} from duel queue`);
  }
}
