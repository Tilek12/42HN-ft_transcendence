import { db } from './client';
import type { match } from '../types'
import type { matchForSummary } from '../types'

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

  export async function getAllMatchesForSummary() {
	const matches = await db.all(
	  `
	  SELECT
		m.id AS matchID,
		u1.username AS player1_username,
		u2.username AS player2_username,
		m.player1_score,
		m.player2_score,
		CASE
		  WHEN m.player1_score > m.player2_score THEN u1.username
		  ELSE u2.username
		END AS winner_username,
		m.is_tournament_match,
		m.played_at
	  FROM matches m
	  JOIN users u1 ON m.player1_id = u1.id
	  JOIN users u2 ON m.player2_id = u2.id
	  ORDER BY m.played_at DESC
	  `
	);
	return matches as matchForSummary[];
  }

export async function getMatchesByUserId(userId: number): Promise<match[]> 
{
	const matches =  db.all(
	`
	SELECT
	m.*,
	u1.username AS player1_username,
	u2.username AS player2_username
	FROM matches m
	JOIN users u1 ON m.player1_id = u1.id
	JOIN users u2 ON m.player2_id = u2.id
	WHERE m.player1_id = ? OR m.player2_id = ?
	ORDER BY m.played_at DESC
	`,
	userId,
	userId
	);
	return matches as unknown as  match[];
}
  

  export async function getMatchById(matchId: number) {
	return db.get(`SELECT * FROM matches WHERE id = ?`, matchId);
  }
