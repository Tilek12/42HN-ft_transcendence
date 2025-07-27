import { db } from './client';
//----------functions for tournament data base-----------
export async function createTournament(name: string, createdByUserId: number) {
	await db.run(
	  `INSERT INTO tournaments (name, created_by_user_id) VALUES (?, ?)`,
	  name,
	  createdByUserId
	);
  }

export async function joinTournament(tournamentId: number, userId: number) {
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