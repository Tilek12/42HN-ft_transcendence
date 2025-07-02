import { renderNav } from './nav'
import {Player} from '../../../backend/src/game/engine/types'
import {createRounds} from '../../../backend/src/game/engine/create-rounds'
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

export function renderTournament(root: HTMLElement) {
	const rounds = createRounds(players);
  
	root.innerHTML = renderNav() + `
	  <h1 class="text-3xl font-semibold mb-8 text-center">Tournament Bracket</h1>
	  <div class="flex flex-col items-center">
		${rounds
		  .map(
			(round) => `
		  <div class="flex space-x-6 mb-8 justify-center w-full max-w-screen-lg">
			${round
			  .map(
				(player) => `
			  <div
				class="border border-yellow-600 rounded-full px-4 py-2 w-24 text-center bg-yellow-100"
				title="Player ID: ${player.id}"
			  >
				${player.name}
			  </div>
			`
			  )
			  .join('')}
		  </div>
		`
		  )
		  .join('')}
	  </div>
	`;
  }

  let players: Player[] = [
	{ id: 'p1', name: 'Alice'},
	{ id: 'p2', name: 'Bob'},
	{ id: 'p3', name: 'Carol'},
	{ id: 'p4', name: 'Dave'},
	{ id: 'p5', name: 'Eve'},
	{ id: 'p6', name: 'Frank'},
	{ id: 'p7', name: 'Grace'},
	{ id: 'p8', name: 'Heidi' },
	{ id: 'p9', name: 'Timi' },
	{ id: 'p10', name: 'Kreg' },
	{ id: 'p11', name: 'Nick' },
	{ id: 'p12', name: 'Nele' },
	{ id: 'p13', name: 'Sol' }
  ];
  
  const root = document.getElementById('app')!;
  renderTournament(root);
