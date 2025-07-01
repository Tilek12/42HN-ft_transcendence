import {Player, GameState} from './types'

  
  type Round = Player[];

  function shuffle<T>(array: T[]) : T[] {
	const arr = [...array];
	for (let i = arr.length - 1; i > 0; i--)
	{
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
  }

  export function createRounds(players: Player[]): Round[] {
	let rounds: Round[] = [];
	let currentPlayers = shuffle(players);
  
	currentPlayers.forEach((player)=>{player.points =  0; player.winner = false;});
	while (currentPlayers.length > 1) {
		rounds.push(currentPlayers);
		currentPlayers.forEach((player)=>{player.points =  0; player.winner = false;});
		for(let i = 0; i < currentPlayers.length; i+=2)  // a simulation of a game
		{
			const player1 = currentPlayers[i];
			const player2 = currentPlayers[i + 1];

			if(!player2)
			{
				player1.winner = true;
				continue;
			}
			while(player1.points < 5 && player2.points < 5)
			{
				let pl1 = Math.random();
				let pl2 = Math.random();
				if (pl1 > pl2)
					player1.points++;
				else
					player2.points++;
			}
			player1.points < 5 ? player2.winner = true : player1.winner = true; 
		}
	  currentPlayers = shuffle(currentPlayers.filter((player) => player.winner));

	}
	rounds.push(currentPlayers);
	return rounds;
  }