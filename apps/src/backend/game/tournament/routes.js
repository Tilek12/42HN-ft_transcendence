"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = require("fastify");
const tournament_manager_1 = require("./tournament-manager");
const tournamentRoutes = async (fastify) => {
    fastify.get('/tournaments', async (req, res) => {
        res.send((0, tournament_manager_1.getSafeTournamentData)());
    });
};
exports.default = tournamentRoutes;
//# sourceMappingURL=routes.js.map