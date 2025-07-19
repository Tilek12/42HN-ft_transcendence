import { FastifyPluginAsync } from 'fastify';
import { getAvailableTournaments } from './tournament-manager';

const tournamentRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/available', async (req, res) => {
    const tournaments = getAvailableTournaments().map(t => ({
      id: t.id,
      size: t.size,
      status: t.status,
      joined: t.players.length
    }));
    res.send(tournaments);
  });
};

export default tournamentRoutes;
