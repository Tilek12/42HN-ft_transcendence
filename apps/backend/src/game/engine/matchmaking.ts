import { Player } from './types';
import { GameRoom } from './game-room';

const waiting: Player[] = [];

export function enqueuePlayer(player: Player) {
  waiting.push(player);

  if (waiting.length >= 2) {
    const p1 = waiting.shift()!;
    const p2 = waiting.shift()!;
    new GameRoom(p1, p2); // start game
  }
}
