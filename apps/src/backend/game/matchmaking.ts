import { Player, GameMode, GhostPlayer } from './game-types';
import { gameManager } from '../service-managers/game-manager';
import { onlineTournamentManager } from '../service-managers/online-tournament-manager';
import { localTournamentManager } from '../service-managers/local-tournament-manager';
import { incrementWinsOrLossesOrTrophies } from '../database/profile';
import { createMatch } from '../database/match';

export async function startGame(player: Player, mode: GameMode, tournamentId?: string) {

	if (mode === 'solo') {
		gameManager.createGame(mode, player, GhostPlayer);
		return;
	}

	if (mode === 'online-match' || mode === 'local-match') {
		// The game room should already exist, just update the player's socket
		const tournamentManager = mode === 'online-match'
			? onlineTournamentManager
			: localTournamentManager;
		const game = tournamentManager.getGameForPlayer(player.id);
		if (game) {
			game.updateSocket(player);
		}
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
		gameManager.removeWaitingDuelPlayer(p1!.id);
		gameManager.removeWaitingDuelPlayer(p2!.id);

		const game = gameManager.createGame( 'duel',p1! ,p2!, tournamentId);
		game.onEndCallback( async(winner, loser, winnerScore, loserScore) => {
			//------Thomas code-------
			if (winner)
				await incrementWinsOrLossesOrTrophies(parseInt(winner.id), "wins");
			if (loser)
				await incrementWinsOrLossesOrTrophies(parseInt(loser.id), "losses");

			//------ Save to matches table -------
			const isTournamentMatch = mode === 'duel' && !!tournamentId;
			if (isTournamentMatch) {
				await createMatch(
					parseInt(winner.id),
					parseInt(loser.id),
					winnerScore,
					loserScore,
					isTournamentMatch
				);
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
