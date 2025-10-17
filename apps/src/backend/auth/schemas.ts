import { FromSchema } from 'json-schema-to-ts';

const EmailSchema = {
	type: 'string',
	format: 'email',
	minLength: 1,
	maxLength: 255,
} as const;
export type Email = FromSchema<typeof EmailSchema>;


const StringSchema = {
	type: 'string',
	minLength: 1,
	maxLength: 255,
} as const;
// export type StringSchema = FromSchema<typeof StringSchema>;

const IdSchema = {
	type: 'integer',
	minimum: 1,
} as const;
// export type StringSchema = FromSchema<typeof StringSchema>;

const DateTimeSchema = {
	type: 'string',
	format: 'date-time',
} as const;
// export type StringSchema = FromSchema<typeof StringSchema>;

const BearerSchema = {
	type: 'string',
	pattern: '^Bearer\\s.+'
} as const;
// export type StringSchema = FromSchema<typeof StringSchema>;

const UsernameSchema = {
	type: 'string',
	minLength: 3,
	maxLength: 30,
} as const;
// export type StringSchema = FromSchema<typeof StringSchema>;

const PasswrdSchema = {
	type: 'string',
	pattern: '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).*$',
	minLength: 8,
	maxLength: 64,
} as const;
// export type StringSchema = FromSchema<typeof StringSchema>;

const TFA_token_schema = {
	type: 'string',
	minLength: 6,
	maxLength: 6,
} as const;
// export type StringSchema = FromSchema<typeof StringSchema>;


export const loginSchema = {
	//swagger
	description: 'loginSchema',
	tags: ['auth'],
	summary: 'login',
	hidden: false,
	//query
	// querystring: false,
	//body
	body: {
		type: 'object',
		required: ['username', 'password'],
		properties: {
			username: UsernameSchema,
			password: PasswrdSchema,
			tfa_token: TFA_token_schema,
		},
	},
} as const;
export type LoginBody = FromSchema<typeof loginSchema.body>;

export const logoutSchema = {
	//swagger
	description: 'logoutSchema',
	tags: ['auth'],
	summary: 'logout',
	hidden: false,
	headers: {
		type: 'object',
		properties: {
			Authorization: BearerSchema
		},
		required: ['Authorization']
	},
} as const;


export const profileSchema = { //not used anywhere yet??
	description: 'profileSchema',
	tags: ['user'],
	summary: 'getting profile information',
	hidden: false,
	params: {
		type: 'object',
		properties: {
			id: {
				type: 'string',
				description: 'user id'
			}
		}
	},
	// querystring: false,
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
} as const;
export type profileBody = FromSchema<typeof profileSchema>;

export const registerSchema = {
	description: 'register schema',
	tags: ['auth'],
	summary: 'registering information',
	hidden: false,
	params: {
		type: 'object',
		properties: {
			id: IdSchema,
		}
	},
	// querystring: false,
	body: {
		type: 'object',
		required: ['username', 'email', 'password'],
		properties: {
			username: UsernameSchema,
			email: EmailSchema,
			password: PasswrdSchema,
		},
	},
} as const;
export type StringS = FromSchema<typeof StringSchema>;



export const toggle_TFA_Schema = {
	//swagger===========================================================
	description: 'toggle 2fa',
	tags: ['2FA'],
	summary: 'sends a post request to toggle 2fa auth',
	hidden: false,
	// query===============================================================
	//headers=============================================================
	headers: {
		type: 'object',
		properties: {
			Authorization: BearerSchema
		},
		required: ['Authorization']
	},
	// querystring: false,

	//body===============================================================
	body: {
		type: 'object',
		properties: {
			enable: { type: 'boolean' },
			email: EmailSchema,
			password: PasswrdSchema,
			TFA_token: TFA_key_schema,
		},
		required: ['enable','email','password']
	},
	//response============================================================
	response: {
		200: {
			type: 'object',
			properties: { message: { type: 'string' } }
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
} as const;
export type toggle_TFA_body = FromSchema<typeof toggle_TFA_Schema.body>;

export const verify_TFA_Schema = {
	//swagger===========================================================
	description: 'toggle 2fa',
	tags: ['2FA'],
	summary: 'sends a post request to toggle 2fa auth',
	hidden: false,
	// query===============================================================
	//headers=============================================================
	// headers: {
	// 	type: 'object',
	// 	properties: {
	// 	},
	// },
	// querystring: false,

	//body===============================================================
	body: {
		type: 'object',
		properties: {
			email: EmailSchema,
			password: PasswrdSchema,
			TFA_token: TFA_token_schema,
		},
		required: ['TFA_token','email','password']
	},
	//response============================================================
	response: {
		200: {
			type: 'object',
			properties: { message: { type: 'string' } }
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
} as const;
export type verify_TFA_body = FromSchema<typeof verify_TFA_Schema.body>;



// export const disable2faSchema = {
// 	//swagger===========================================================
// 	description: 'TwoFA_schema',
// 	tags: ['2FA'],
// 	summary: '',
// 	operationId: '12345',
// 	hidden: false,
// 	//query===============================================================
// 	querystring: false,
// 	//headers=============================================================
// 	headers: {
// 		type: 'object',
// 		properties: {
// 			Authorization: { type: 'string', pattern: '^Bearer.+' }
// 		},
// 		required: ['Authorization']
// 	},
// 	//body===============================================================
// 	body: {
// 		type: 'object',
// 		required: ['requiredKey'],
// 		properties: {
// 			someKey: { type: 'string' },
// 			someOtherKey: { type: 'number' },
// 			requiredKey: {
// 				type: 'array', //Must be an array.
// 				maxItems: 3,// Must contain at most 3 items.
// 				items: { type: 'integer' } //Must contain only integers.
// 			},
// 			nullableKey: { type: ['number', 'null'] }, // or { type: 'number', nullable: true }
// 			multipleTypesKey: { type: ['boolean', 'number'] }, //Can either be a boolean or a number.
// 			multipleRestrictedTypesKey: {
// 				oneOf: [ //Must match exactly one of the rules:
// 					{ type: 'string', maxLength: 5 }, //A string with max length 5
// 					{ type: 'number', minimum: 10 } //A number ≥ 10
// 				]
// 			},
// 			enumKey: {
// 				type: 'string', //Must be a string.
// 				enum: ['John', 'Foo'] //Must be exactly "John" or "Foo"
// 			},
// 			notTypeKey: {
// 				not: { type: 'array' } // Value cannot be an array.
// 			}
// 		}
// 	},
// 	//response============================================================
// 	response: {
// 		200: {
// 			type: 'object',
// 			properties: {
// 				id: { type: 'string' },
// 				name: { type: 'string' }
// 			}
// 		},
// 		404: {
// 			type: 'object',
// 			properties: { message: { type: 'string' } }
// 		},
// 		400: {
// 			type: 'object',
// 			properties: { message: { type: 'string' } }
// 		},
// 	}
// };