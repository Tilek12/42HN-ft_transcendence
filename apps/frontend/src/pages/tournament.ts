import { renderNav } from './nav'

type Player = {
	id: string;
	name: string;
	winner?: boolean;
  };
  
  type Round = Player[];
  
  function createRounds(players: Player[]): Round[] {
	let rounds: Round[] = [];
	let currentPlayers = players;
  
	while (currentPlayers.length > 1) {
	  rounds.push(currentPlayers);
	  currentPlayers.forEach((player, i) => {player.winner = i%2 === 0;});
	  currentPlayers = currentPlayers.filter((player) => player.winner);
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
	{ id: 'p11', name: 'Nele' }
  ];
  
  const root = document.getElementById('app')!;
  renderTournament(root);
