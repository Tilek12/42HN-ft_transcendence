"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tournament = void 0;
exports.createTournament = createTournament;
exports.joinTournament = joinTournament;
exports.getSafeTournamentData = getSafeTournamentData;
exports.getUserTournament = getUserTournament;
exports.advanceTournament = advanceTournament;
exports.quitTournament = quitTournament;
const types_1 = require("../engine/types");
const game_room_1 = require("../engine/game-room");
const presence_1 = require("../../websocket/presence");
const tournament_1 = require("../../websocket/tournament");
let tournaments = [];
let nextId = 1;
function getTournamentById(id) {
    return tournaments.find(t => t.id === id);
}
function getUserTournament(userId) {
    return tournaments.find(t => t.status === 'waiting' && t.players.some(p => p.id === userId));
}
function createTournament(player, size) {
    if (getUserTournament(player.id))
        return null;
    const tournament = {
        id: `t-${nextId++}`,
        size,
        players: [player],
        hostId: player.id,
        status: 'waiting',
        rounds: []
    };
    tournaments.push(tournament);
    console.log(`🏆 [Tournament: ${tournament.id}] Created`);
    (0, presence_1.broadcastTournaments)();
    return tournament;
}
function joinTournament(player, tournamentId) {
    if (getUserTournament(player.id))
        return null;
    const tournament = getTournamentById(tournamentId);
    if (!tournament || tournament.status !== 'waiting' || tournament.players.length >= tournament.size) {
        return null;
    }
    tournament.players.push(player);
    (0, presence_1.broadcastTournaments)();
    if (tournament.players.length === tournament.size) {
        startTournament(tournament);
    }
    console.log(`🏆 [Tournament: ${tournamentId}] Player joined: ${player.id}`);
    return tournament;
}
function startTournament(t) {
    t.status = 'active';
    const round = [];
    for (let i = 0; i < t.players.length; i += 2) {
        const p1 = t.players[i];
        const p2 = t.players[i + 1];
        const game = new game_room_1.GameRoom(p1, p2, t.id);
        round.push(game);
        // 🔔 Notify both players to redirect to match view
        notifyMatchStart(t.id, p1.id, p2.id);
        // DB //
        // TODO: Save match start to DB (with p1.id, p2.id, t.id, timestamp)
        ////////
    }
    t.rounds.push(round);
    console.log(`🏆 [Tournament: ${t.id}] Started`);
    (0, presence_1.broadcastTournaments)();
}
function advanceTournament(tournamentId, winner) {
    const t = getTournamentById(tournamentId);
    if (!t || t.status !== 'active')
        return;
    const lastRound = t.rounds[t.rounds.length - 1];
    const winners = lastRound.map(g => g.getWinner()).filter(Boolean);
    // 🔖 TODO: Save each game's result to DB
    // for (const game of lastRound) {
    //   const w = game.getWinner();
    //   const l = game.getLoser?.();
    //   if (w && l) {
    //     // Example: await saveMatchResultToDB(w.id, l.id, t.id, game.getId());
    //   }
    // }
    if (winners.length === 1) {
        t.status = 'finished';
        // 🔖 TODO: Save tournament result to DB: t.id, winner.id, etc.
        // Example: await saveTournamentResult(t.id, winners[0].id);
        console.log(`🏁 [Tournament: ${t.id}] Finished! Winner: ${winners[0].id}`);
        (0, presence_1.broadcastTournaments)();
        return;
    }
    const newRound = [];
    for (let i = 0; i < winners.length; i += 2) {
        const p1 = winners[i];
        const p2 = winners[i + 1] || null;
        const game = new game_room_1.GameRoom(p1, p2, tournamentId);
        newRound.push(game);
        if (p2)
            notifyMatchStart(t.id, p1.id, p2.id);
        // DB //
        // TODO: Save new match start to DB
        ////////
    }
    t.rounds.push(newRound);
    (0, presence_1.broadcastTournaments)();
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
function quitTournament(userId) {
    const t = getUserTournament(userId);
    if (!t)
        return;
    t.players = t.players.filter(p => p.id !== userId);
    console.log(`❌ [Tournament: ${t.id}] Player quit: ${userId}`);
    // Remove if empty
    if (t.players.length === 0) {
        tournaments = tournaments.filter(x => x.id !== t.id);
        console.log(`🗑 [Tournament: ${t.id}] Empty tournament deleted`);
    }
    (0, presence_1.broadcastTournaments)();
}
// Helper to notify players
function notifyMatchStart(tournamentId, player1Id, player2Id) {
    const payload = {
        type: 'matchStart',
        tournamentId,
        matchId: `m-${Date.now()}`, // optionally match IDs could be tracked in state
        player1: player1Id,
        player2: player2Id
    };
    for (const id of [player1Id, player2Id]) {
        const ws = tournament_1.tournamentSockets.get(id);
        if (ws && ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify(payload));
        }
    }
}
//# sourceMappingURL=tournament-manager.js.map