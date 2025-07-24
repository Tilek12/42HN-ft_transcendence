export const COLORS = {
	squidGame: {
	  greenDark: '#037a76',
	  greenLight: '#249f9c',
	  pinkDark: '#ed1b76',
	  pinkLight: '#f44786'
	}
  } as const;

  export type SquidGameColors = keyof typeof COLORS.squidGame;
