import { db } from './client';
//----------functions for matches data base-----------
export async function createMatch(
	player1Id: number,
	player2Id: number,
	player1Score: number,
	player2Score: number,
	isTournamentMatch: boolean = false
  ) {
	const winnerId =
	  player1Score > player2Score ? player1Id :
	  player2Score > player1Score ? player2Id :
	  null;
  
	const isTie = player1Score === player2Score;
  
	await db.run(
	  `
	  INSERT INTO matches (
		player1_id, player2_id,
		player1_score, player2_score,
		winner_id, is_tie, is_tournament_match
	  ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
	  player1Id,
	  player2Id,
	  player1Score,
	  player2Score,
	  winnerId,
	  isTie,
	  isTournamentMatch
	);
  }

  export async function getAllMatches() {
	return db.all(`SELECT * FROM matches ORDER BY played_at DESC`);
  }

  export async function getMatchesByUserId(userId: number) {
	return db.all(
	  `
	  SELECT * FROM matches
	  WHERE player1_id = ? OR player2_id = ?
	  ORDER BY played_at DESC
	  `,
	  userId,
	  userId
	);
  }

  export async function getMatchById(matchId: number) {
	return db.get(`SELECT * FROM matches WHERE id = ?`, matchId);
  }
