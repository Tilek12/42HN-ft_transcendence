import { renderNav } from './nav'
import {Player} from '../../../backend/src/game/engine/types'
// import {createRounds} from '../../../backend/src/game/engine/create-rounds'

//training with sockets

const socket = new WebSocket('ws://localhost:3000/ws-echo');
socket.onmessage = e => console.log(e.data);
socket.onopen = () => socket.send('Hello Server!');

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
	  for(let i = 0; i < currentPlayers.length; i+=2)  // a proxy of a game
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
  root.innerHTML = renderNav() + `
    <div class="text-center">
      <h1 class="text-3xl font-semibold">Tournament Bracket</h1>
      <p class="text-gray-500">Upcoming matches and scores.</p>
    </div>
  `
}
