import { Player } from './types';
import { GameRoom } from './game-room';

const waitingDuel: Player[] = [];

export function startGame(player: Player, mode: 'solo' | 'duel') {
  if (mode === 'solo') {
    new GameRoom(player, null); // solo player vs self or AI later
  } else {
    waitingDuel.push(player);
    if (waitingDuel.length >= 2) {
      const p1 = waitingDuel.shift()!;
      const p2 = waitingDuel.shift()!;
      new GameRoom(p1, p2);
    }
  }
}
