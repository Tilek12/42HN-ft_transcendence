import { FastifyPluginAsync } from 'fastify';
import { getSafeTournamentData } from './tournament-manager';

const tournamentRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/tournaments', async (req, res) => {
    res.send(getSafeTournamentData());
  });
};

export default tournamentRoutes;
