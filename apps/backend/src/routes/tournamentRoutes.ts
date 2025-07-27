import { FastifyPluginAsync } from 'fastify';
import {
  createTournament,
  joinTournament,
  getAllTournaments,
  getTournamentById,
  getTournamentParticipants,
  linkMatchToTournament,
  getMatchesByTournamentId,
} from '../database/tournament';

const tournamentRoutes: FastifyPluginAsync = async (fastify) => {
  // Create a tournament
  fastify.post('/tournament', async (req, res) => {
    try {
      const jwt = await req.jwtVerify();
      const { name } = req.body as any;

      if (!name || typeof name !== 'string') {
        return res.status(400).send({ message: 'Invalid tournament name' });
      }

      await createTournament(name, jwt.id);
      res.send({ message: 'Tournament created' });
    } catch (err) {
      res.status(401).send({ message: 'Unauthorized or error creating tournament' });
    }
  });

  // Join a tournament
  fastify.post('/tournament/join', async (req, res) => {
    try {
      const jwt = await req.jwtVerify();
      const { tournamentId } = req.body as any;

      if (typeof tournamentId !== 'number') {
        return res.status(400).send({ message: 'Invalid tournament ID' });
      }

      await joinTournament(tournamentId, jwt.id);
      res.send({ message: 'Joined tournament successfully' });
    } catch (err) {
      res.status(401).send({ message: 'Unauthorized or error joining tournament' });
    }
  });

  // Link a match to a tournament
  fastify.post('/tournament/link-match', async (req, res) => {
    try {
      const jwt = await req.jwtVerify();
      const { tournamentId, matchId } = req.body as any;

      if (
        typeof tournamentId !== 'number' ||
        typeof matchId !== 'number'
      ) {
        return res.status(400).send({ message: 'Invalid input' });
      }

      await linkMatchToTournament(tournamentId, matchId);
      res.send({ message: 'Match linked to tournament' });
    } catch (err) {
      res.status(401).send({ message: 'Unauthorized or error linking match' });
    }
  });

  // Get all tournaments (public)
  fastify.get('/tournament', async (_req, res) => {
    try {
      const tournaments = await getAllTournaments();
      res.send(tournaments);
    } catch (err) {
      res.status(500).send({ message: 'Error retrieving tournaments' });
    }
  });

  // Get tournament by ID (public)
  fastify.get('/tournament/:id', async (req, res) => {
    const { id } = req.params as any;
    const tid = parseInt(id);

    if (isNaN(tid)) {
      return res.status(400).send({ message: 'Invalid tournament ID' });
    }

    const tournament = await getTournamentById(tid);
    if (!tournament) {
      return res.status(404).send({ message: 'Tournament not found' });
    }

    res.send(tournament);
  });

  // Get participants of a tournament (public)
  fastify.get('/tournament/:id/participants', async (req, res) => {
    const { id } = req.params as any;
    const tid = parseInt(id);

    if (isNaN(tid)) {
      return res.status(400).send({ message: 'Invalid tournament ID' });
    }

    const participants = await getTournamentParticipants(tid);
    res.send(participants);
  });

  // Get matches of a tournament (public)
  fastify.get('/tournament/:id/matches', async (req, res) => {
    const { id } = req.params as any;
    const tid = parseInt(id);

    if (isNaN(tid)) {
      return res.status(400).send({ message: 'Invalid tournament ID' });
    }

    const matches = await getMatchesByTournamentId(tid);
    res.send(matches);
  });
};

export default tournamentRoutes;
