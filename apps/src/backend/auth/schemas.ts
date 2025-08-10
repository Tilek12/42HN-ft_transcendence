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
  export const profileSchema = {
	body: {
	  type: 'object',
	  required: ['logged_in', 'username', 'password'],
	  properties: {
		logged_in: {type: 'boolean'},
		username: { type: 'string' },
		password: { type: 'string' },
		wins: {type: 'integer', minimum: 0},
		losses: {type: 'integer', minimum: 0},
		trophies: {type: 'integer', minimum: 0}
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
