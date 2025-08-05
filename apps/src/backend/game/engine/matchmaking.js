"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startGame = startGame;
exports.cancelDuelSearch = cancelDuelSearch;
const types_1 = require("./types");
const game_room_1 = require("./game-room");
const user_manager_1 = require("../../user/user-manager");
function startGame(player, mode) {
    if (mode === 'solo') {
        new game_room_1.GameRoom(player, null);
        return;
    }
    if (user_manager_1.userManager.getWaitingDuel().has(player.id)) {
        console.warn(`🚫 Player ${player.id} already waiting for a duel`);
        return;
    }
    user_manager_1.userManager.setWaitingDuelPlayer(player.id, player);
    const players = Array.from(user_manager_1.userManager.getWaitingDuel().values());
    if (players.length >= 2) {
        const [p1, p2] = players;
        user_manager_1.userManager.removeWaitingDuelPlayer(p1.id);
        user_manager_1.userManager.removeWaitingDuelPlayer(p2.id);
        new game_room_1.GameRoom(p1, p2);
    }
}
function cancelDuelSearch(userId) {
    if (user_manager_1.userManager.getWaitingDuel().has(userId)) {
        user_manager_1.userManager.removeWaitingDuelPlayer(userId);
        console.log(`🛑 [Matchmaking] Removed ${userId} from duel queue`);
    }
}
//# sourceMappingURL=matchmaking.js.map