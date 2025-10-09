import { kMaxLength } from "buffer";

const EmailSchema = {
	type: 'string',
	format: 'email',
	minLength: 1,
	maxLength: 255,
};

const StringSchema = {
	type: 'string',
	minLength: 1,
	maxLength: 255,
};

const IdSchema = {
	type: 'integer',
	minimum: 1,
};

const DateTimeSchema = {
	type: 'string',
	format: 'date-time', 
}

const UsernameSchema = {
	type: 'string',
	minLength: 3,
	maxLength: 30,
}

const PasswrdSchema = {
	type: 'string',
	pattern: '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).*$',
	minLength: 8,
	maxLength: 64,
};

export const loginSchema = {
	//swagger
	description: 'loginSchema',
	tags: ['user'],
	summary: 'login',
	//query
	querystring: false,
	//body
	body: {
		type: 'object',
		required: ['username', 'password'],
		properties: {
			username: UsernameSchema,
			password: PasswrdSchema,
		},
	},
	//route params validation | not needed her imo - philipp
	// params: {
	// 	type: 'object',
	// 	properties: {
	// 		id: IdSchema,
	// 		}
	// },
};

export const profileSchema = { //not used anywhere yet??
	description: 'profileSchema',
	tags: ['user'],
	summary: 'getting profile information',
	params: {
		type: 'object',
		properties: {
			id: {
				type: 'string',
				description: 'user id'
			}
		}
	},
	body: {
		type: 'object',
		required: ['logged_in', 'username', 'password'],
		properties: {
			logged_in: { type: 'boolean' },
			username: { type: 'string' },
			password: { type: 'string' },
			wins: { type: 'integer', minimum: 0 },
			losses: { type: 'integer', minimum: 0 },
			trophies: { type: 'integer', minimum: 0 }
		},
	},
};

export const registerSchema = {
	description: 'register schema',
	tags: ['user'],
	summary: 'registering information',
	params: {
		type: 'object',
		properties: {
			id: IdSchema,
		}
	},
	querystring: false,
	body: {
		type: 'object',
		required: ['username', 'email', 'password'],
		properties: {
			username: UsernameSchema,
			email: EmailSchema,
			password: PasswrdSchema,
			
		},
	},
};

export const TwoFA_setup_schema = {
	//swagger===========================================================
	description: 'TwoFA_schema',
	tags: ['2FA'],
	summary: '',
	operationId: '12345',
	hidden: false,
	//query===============================================================
	querystring: false,
	//headers=============================================================
	headers: {
		type: 'object',
		properties: {
			Authorization: { type: 'string', pattern: '^Bearer.+'}
		},
		required: ['Authorization']
	},
	//body===============================================================
	body: {
		type: 'object',
		required: ['requiredKey'],
		properties: {
			someKey: { type: 'string' },
			someOtherKey: { type: 'number' },
			requiredKey: {
				type: 'array', //Must be an array.
				maxItems: 3,// Must contain at most 3 items.
				items: { type: 'integer' } //Must contain only integers.
			},
			nullableKey: { type: ['number', 'null'] }, // or { type: 'number', nullable: true }
			multipleTypesKey: { type: ['boolean', 'number'] }, //Can either be a boolean or a number.
			multipleRestrictedTypesKey: {
				oneOf: [ //Must match exactly one of the rules:
					{ type: 'string', maxLength: 5 }, //A string with max length 5
					{ type: 'number', minimum: 10 } //A number ≥ 10
				]
			},
			enumKey: {
				type: 'string', //Must be a string.
				enum: ['John', 'Foo'] //Must be exactly "John" or "Foo"
			},
			notTypeKey: {
				not: { type: 'array' } // Value cannot be an array.
			} 
		}
	},
	//response============================================================
	response: {
		200: {
			type: 'object',
			properties: {
				id: { type: 'string' },
				name: { type: 'string' }
			}
		},
		404: {
			type: 'object',
			properties: { message: { type: 'string' } }
		},
		400: {
			type: 'object',
			properties: { message: { type: 'string' } }
		},
	}
};