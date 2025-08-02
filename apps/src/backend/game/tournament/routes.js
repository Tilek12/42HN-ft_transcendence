import { getSafeTournamentData } from './tournament-manager';
const tournamentRoutes = async (fastify) => {
    fastify.get('/tournaments', async (req, res) => {
        res.send(getSafeTournamentData());
    });
};
export default tournamentRoutes;
