import { FastifyPluginAsync } from 'fastify';
import {
  createMatch,
  getAllMatches,
  getMatchesByUserId,
  getMatchById,
} from '../database/match';

const matchRoutes: FastifyPluginAsync = async (fastify) => {
  // Create a match (requires authentication)
  fastify.post('/match', async (req, res) => {
    try {
      const jwt = await req.jwtVerify(); // validate JWT
      const {
        player1Id,
        player2Id,
        player1Score,
        player2Score,
        isTournamentMatch,
      } = req.body as any;

      if (
        typeof player1Id !== 'number' ||
        typeof player2Id !== 'number' ||
        typeof player1Score !== 'number' ||
        typeof player2Score !== 'number'
      ) {
        return res.status(400).send({ message: 'Invalid input data' });
      }

      await createMatch(player1Id, player2Id, player1Score, player2Score, isTournamentMatch);
      res.send({ message: 'Match created successfully' });
    } catch (err) {
      res.status(401).send({ message: 'Unauthorized or error creating match' });
    }
  });

  // Get all matches (public)
  fastify.get('/match', async (_req, res) => {
    try {
      const matches = await getAllMatches();
      res.send(matches);
    } catch (err) {
      res.status(500).send({ message: 'Error retrieving matches' });
    }
  });

  // Get matches for a user (requires authentication)
  fastify.get('/match/user', async (req, res) => {
    try {
      const jwt = await req.jwtVerify();
      const matches = await getMatchesByUserId(jwt.id);
      res.send(matches);
    } catch (err) {
      res.status(401).send({ message: 'Unauthorized or error retrieving matches' });
    }
  });

  // Get match by ID (public)
  fastify.get('/match/:matchId', async (req, res) => {
    const { matchId } = req.params as any;
    const id = parseInt(matchId);

    if (isNaN(id)) {
      return res.status(400).send({ message: 'Invalid match ID' });
    }

    const match = await getMatchById(id);
    if (!match) return res.status(404).send({ message: 'Match not found' });

    res.send(match);
  });
};

export default matchRoutes;
