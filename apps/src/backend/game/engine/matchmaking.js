"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startGame = startGame;
exports.cancelDuelSearch = cancelDuelSearch;
const types_1 = require("./types");
const game_room_1 = require("./game-room");
const waitingDuel = new Map();
function startGame(player, mode) {
    if (mode === 'solo') {
        new game_room_1.GameRoom(player, null);
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
        new game_room_1.GameRoom(p1, p2);
    }
}
function cancelDuelSearch(userId) {
    if (waitingDuel.has(userId)) {
        waitingDuel.delete(userId);
        console.log(`🛑 [Matchmaking] Removed ${userId} from duel queue`);
    }
}
//# sourceMappingURL=matchmaking.js.map