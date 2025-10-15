import { Player, GameMode } from './game-types';
import { gameManager } from '../service-managers/game-manager';
import { tournamentManager } from '../service-managers/tournament-manager';
import { incrementWinsOrLossesOrTrophies } from '../database/profile';
import { createMatch } from '../database/match';

export async function startGame(player: Player, mode: GameMode, tournamentId?: string) {

	if (mode === 'solo') {
		gameManager.createGame(mode, player, undefined);
		return;
	}

	if (mode !== 'duel') {
		console.warn(`🚫 Invalid game mode: ${mode}`);
		return;
	}

	if (gameManager.getWaitingDuel().has(player.id)) {
		console.warn(`🚫 Player ${player.id} already waiting for a duel`);
		return;
	}

	gameManager.setWaitingDuelPlayer(player.id, player);
	const players = Array.from(gameManager.getWaitingDuel().values());

	if (players.length >= 2) {
		const [p1, p2] = players;
		gameManager.removeWaitingDuelPlayer(p1.id);
		gameManager.removeWaitingDuelPlayer(p2.id);

		const game = gameManager.createGame(p1, p2, tournamentId);
		game.onEndCallback( async(winner, loser, winnerScore, loserScore) => {
			//------Thomas code-------
			if (winner)
				await incrementWinsOrLossesOrTrophies(parseInt(winner.id), "wins");
			if (loser)
				await incrementWinsOrLossesOrTrophies(parseInt(loser.id), "losses");

			//------ Save to matches table -------
			const isTournamentMatch = mode === 'duel' && !!tournamentId;
			if (isTournamentMatch) {
				const mode = tournamentManager.getTournamentMode(tournamentId!);
				if (mode !== 'local') {
					await createMatch(
						parseInt(winner.id),
						parseInt(loser.id),
						winnerScore,
						loserScore,
						isTournamentMatch
					);
				}
			}

			// Get last inserted match ID
			//    const { id: lastMatchId } = await db.get(`SELECT last_insert_rowid() as id`);
			// Link match to tournament
			// if (isTournamentMatch && tournamentId) {
			//   await linkMatchToTournament(parseInt(tournamentId.split('-')[1]), lastMatchId);
			// }
		});
	}
}

export function cancelDuelSearch(userId: string) {
	if (gameManager.getWaitingDuel().has(userId)) {
		gameManager.removeWaitingDuelPlayer(userId);
		console.log(`🛑 [Matchmaking] Removed ${userId} from duel queue`);
	}
}
