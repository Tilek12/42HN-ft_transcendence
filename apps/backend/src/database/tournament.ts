import { db } from './client';
//----------functions for tournament data base-----------
export async function createTournamentDB(name: string, createdByUserId: number) {
	await db.run(
	  `INSERT INTO tournaments (name, created_by_user_id) VALUES (?, ?)`,
	  name,
	  createdByUserId
	);
  }

export async function joinTournamentDB(tournamentId: number, userId: number) {
await db.run(
	`INSERT OR IGNORE INTO tournament_participants (tournament_id, user_id) VALUES (?, ?)`,
	tournamentId,
	userId
);
}

export async function getTournamentById(tournamentId: number) {
	return db.get(
	  `SELECT * FROM tournaments WHERE id = ?`,
	  tournamentId
	);
  }

export async function getAllTournaments() {
return db.all(`SELECT * FROM tournaments ORDER BY start_time DESC`);
}

export async function getTournamentParticipants(tournamentId: number) {
	return db.all(
	  `
	  SELECT users.id, users.username
	  FROM tournament_participants
	  JOIN users ON users.id = tournament_participants.user_id
	  WHERE tournament_participants.tournament_id = ?
	  `,
	  tournamentId
	);
  }

export async function linkMatchToTournament(tournamentId: number, matchId: number) {
await db.run(
	`INSERT INTO tournament_matches (tournament_id, match_id) VALUES (?, ?)`,
	tournamentId,
	matchId
);
}

export async function getMatchesByTournamentId(tournamentId: number) {
return db.all(
	`
	SELECT m.*
	FROM tournament_matches tm
	JOIN matches m ON tm.match_id = m.id
	WHERE tm.tournament_id = ?
	ORDER BY m.played_at DESC
	`,
	tournamentId
);
}

export async function getTournamentLeaderboard(tournamentId: number) {
	return db.all(
	  `
	  SELECT 
		u.username,
		p.wins,       -- global wins
		p.losses,     -- global losses
		p.trophies,   -- global trophies
  
		-- 🧮 All matches this user has played (in or out of tournament)
		(
		  SELECT COUNT(*) 
		  FROM matches m2 
		  WHERE m2.player1_id = u.id OR m2.player2_id = u.id
		) AS matches_played,
  
		-- 🧮 Wins in this tournament only
		SUM(CASE 
		  WHEN m.winner_id = u.id THEN 1 
		  ELSE 0 
		END) AS wins_in_tournament
  
	  FROM tournament_participants tp
	  JOIN users u ON u.id = tp.user_id
	  JOIN profiles p ON p.id = u.id
  
	  LEFT JOIN tournament_matches tm ON tm.tournament_id = tp.tournament_id
	  LEFT JOIN matches m ON m.id = tm.match_id
		AND (m.player1_id = u.id OR m.player2_id = u.id)
  
	  WHERE tp.tournament_id = ?
  
	  GROUP BY u.id;
	  `,
	  tournamentId
	);
  }
  
  export async function getTournamentMatches(tournamentId: number) {
	return db.all(
	  `
	  SELECT
		m.id AS match_id,
		m.played_at,
		u1.username AS player1,
		u2.username AS player2,
		m.player1_score,
		m.player2_score,
		CASE
		  WHEN m.winner_id IS NULL AND m.is_tie = 1 THEN 'Tie'
		  WHEN m.winner_id = u1.id THEN u1.username
		  WHEN m.winner_id = u2.id THEN u2.username
		  ELSE 'Pending'
		END AS result
	  FROM tournament_matches tm
	  JOIN matches m ON tm.match_id = m.id
	  JOIN users u1 ON u1.id = m.player1_id
	  JOIN users u2 ON u2.id = m.player2_id
	  WHERE tm.tournament_id = ?
	  ORDER BY m.played_at ASC
	  `,
	  tournamentId
	);
  }
  