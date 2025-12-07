import type { Config } from 'tailwindcss';

const config: Config = {
	
	theme: {
		extend: {
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				slideIn: {
					'0%': { opacity: '0', transform: 'translateX(100%)' },
					'100%': { opacity: '1', transform: 'translateX(0)' }
				},
				slideOut: {
					'0%': { opacity: '1', transform: 'translateX(0)' },
					'100%': { opacity: '0', transform: 'translateX(100%)' }
				}
			}
		}
	},
	content: ['./src/**/*.{html,ts}'],
	plugins: []
};
export default config;
