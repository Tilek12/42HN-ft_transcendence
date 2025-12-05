import { FastifyPluginAsync } from 'fastify';
import {
	createMatch,
	getAllMatches,
	getMatchesByUserId,
	getMatchById,
	getAllMatchesForSummary
} from '../../database/match';
import { JWTPayload, match, matchHistory } from '../../types'

const matchRoutes: FastifyPluginAsync = async (fastify: any) => {
	// Create a match (requires authentication)
	fastify.post('/match', async (req: any, res: any) => {
		try {

			const jwt = req.user as JWTPayload;

			//-----Thomas comment-------------------
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
			res.status(400).send({ message: 'error creating match' });
		}
	});

	// Get all matches (public)
	fastify.get('/match', async (req: any, res: any) => {
		try {
			const matches = await getAllMatches();
			res.send(matches);
		} catch (err) {
			res.status(500).send({ message: 'Error retrieving matches' });
		}
	});

	// Get matches for a user (requires authentication)
	fastify.get('/match/user', async (req: any, res: any) => {
		try {
			const jwt = req.user as JWTPayload;
			const profile_id = jwt.id;
			const matches: match[] = await getMatchesByUserId(profile_id);
			const matches_count = matches.length;
			//   console.log(matches);

			const win = matches.filter((m: match) => m.winner_id === profile_id).length;
			//   console.log(win);

			const win_rate = Math.floor(win / matches_count * 100);
			const tournament_games = matches.filter((m: match) => m.is_tournament_match).length;
			//-------------Thomas code----------------------
			//   console.log(matches[0]);
			//----------------------------------------------
			const send_obj: matchHistory = {
				matches: matches,
				wins: win,
				total: matches_count,
				win_rate: win_rate,
				tournament_games:tournament_games
			};

			res.send({history: send_obj});
		} catch (err: any) {
			res.status(400).send({ message: err.message });
		}
	});

	// Get match by ID (public)
	fastify.get('/match/:matchId', async (req: any, res: any) => {
		const { matchId } = req.params as any;
		const id = parseInt(matchId);

		if (isNaN(id)) {
			return res.status(400).send({ message: 'Invalid match ID' });
		}

		const match = await getMatchById(id);
		if (!match) return res.status(404).send({ message: 'Match not found' });

		res.send(match);
	});

	// Get match summary (public)
	fastify.get('/match/summary', async (req: any, res: any) => {
	try {
	  const matchesSummary = await getAllMatchesForSummary();
	  res.send({ summary: matchesSummary });
	} catch (err: any) {
	  res.status(500).send({ message: 'Error retrieving match summary' });
	}
  });
};

export default matchRoutes;
