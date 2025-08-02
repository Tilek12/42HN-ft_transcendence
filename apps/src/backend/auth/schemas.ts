export const loginSchema = {
	body: {
	  type: 'object',
	  required: ['username', 'password'],
	  properties: {
		username: { type: 'string' },
		password: { type: 'string' },
	  },
	},
  };

  export const registerSchema = {
	body: {
	  type: 'object',
	  required: ['username', 'email', 'password'],
	  properties: {
		username: { type: 'string' },
		email: { type: 'string', format: 'email' },
		password: { type: 'string', minLength: 6 },
	  },
	},
  };
