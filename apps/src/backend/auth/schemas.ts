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

const PasswordSchema = {
	type: 'string',
	pattern: '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).*$',
	minLength: 8,
	maxLength: 64,
} as const;
export type Password = FromSchema<typeof PasswordSchema>;

const TFA_token_schema = {
	type: 'string',
	minLength: 6,
	maxLength: 6,
} as const;
// export type StringSchema = FromSchema<typeof StringSchema>;


export const AuthHeader =
{
	type: 'object',
	properties: {
		Cookie: StringSchema
	},
	required: ['Cookie']
};



/*====================== PROFILE_ROUTES ================================*/

export const ProfileSchema =
	{
		description: 'ProfileSchema',
		tags: ['profile'],
		summary: 'ProfileSchema',
		hidden: false,
		header: AuthHeader,
		//body
		body: {}
	} as const;
export type ProfileBody = FromSchema<typeof ProfileSchema.body>;


export const UploadPicSchema =
	{
		description: 'UploadPicSchema',
		tags: ['profile'],
		summary: 'UploadPicSchema',
		hidden: false,
		header: AuthHeader,
		//body
		body: {}
	} as const;
export type UploadPicBody = FromSchema<typeof UploadPicSchema.body>;


export const DeletePicSchema =
	{
		description: 'DeletePicSchema',
		tags: ['profile'],
		summary: 'DeletePicSchema',
		hidden: false,
		header: AuthHeader,
		//body
		body: {}
	} as const;
export type DeletePicBody = FromSchema<typeof DeletePicSchema.body>;



export const ParseFriendsSchema =
	{
		description: 'ParseFriendsSchema',
		tags: ['profile'],
		summary: 'ParseFriendsSchema',
		hidden: false,
		header: AuthHeader,

	} as const;



export const ProfileIdSchema =
	{
		description: 'ProfileIdSchema',
		tags: ['profile'],
		summary: 'ProfileIdSchema',
		hidden: false,
		header: AuthHeader,
		//body
		body: {
			type: 'object',
			required: ['profileId'],
			properties: {
				profileId: { type: 'string', pattern: '^[0-9]+$ ', minLength: 1 },
			},
		}
	} as const;
export type ProfileIdBody = FromSchema<typeof ProfileIdSchema.body>;



export const AnswerRequestSchema =
	{
		description: 'AnswerRequestSchema',
		tags: ['profile'],
		summary: 'AnswerRequestSchema',
		hidden: false,
		header: AuthHeader,
		//body
		body: {
			type: 'object',
			required: ['profileId', 'profileAnswer'],
			properties: {
				profileId: { type: 'string', pattern: '^[0-9]+$ ', minLength: 1 },
				profileAnswer: { type: 'string', pattern: '^[0-9]+$ ', minLength: 1 }
			},
		}
	} as const;
export type AnswerRequestBody = FromSchema<typeof AnswerRequestSchema.body>;



export const UsernameChangeSchema =
	{
		description: 'UsernameChangeSchema',
		tags: ['profile'],
		summary: 'UsernameChangeSchema',
		hidden: false,
		header: AuthHeader,
		//body
		body: {
			type: 'object',
			required: ['newUsername'],
			properties: {
				newUsername: UsernameSchema,
			},
		}
	} as const;
export type UsernameChangeBody = FromSchema<typeof UsernameChangeSchema.body>;


export const parseProfilesSchema = {
	//swagger
	description: 'parseProfilesSchema',
	tags: ['profile'],
	summary: 'parseProfilesSchema',
	hidden: false,
	header: AuthHeader,
	//query
	querystring: {
		type: 'object',
		properties: {
			offset: { type: 'number' },
			limit: { type: 'number' },
		}
	},

} as const;
export type parseProfilesQuery = FromSchema<typeof parseProfilesSchema.querystring>;


export const PasswordChangeSchema =
	{
		description: 'PasswordChangeSchema',
		tags: ['profile'],
		summary: 'passwordchange',
		hidden: false,
		header: AuthHeader,
		//body
		body: {
			type: 'object',
			required: ['newpassword', 'oldpassword'],
			properties: {
				newpassword: PasswordSchema,
				oldpassword: PasswordSchema,
				tfa_token: TFA_token_schema,
			},
		}
	} as const;
export type PasswordChangeBody = FromSchema<typeof PasswordChangeSchema.body>;

/*====================== REFRESH_ROUTE ================================*/


export const refreshSchema = {
	//swagger
	description: 'refreshSchema',
	tags: ['auth'],
	summary: 'refreshSchema',
	hidden: false,
} as const;





/*====================== AUTH_ROUTES ================================*/

export const loginSchema = {
	//swagger
	description: 'loginSchema',
	tags: ['auth'],
	summary: 'login',
	hidden: false,
	//body
	body: {
		type: 'object',
		required: ['username', 'password'],
		properties: {
			username: UsernameSchema,
			password: PasswordSchema,
			tfa_token: TFA_token_schema,
		},
	},
	response: {
		200: {
			type: 'object',
			properties: { jwt: { type: 'string' }, tfa: { type: 'boolean' } }
		}
	}
} as const;
export type LoginBody = FromSchema<typeof loginSchema.body>;

export const logoutSchema = {
	//swagger
	description: 'logoutSchema',
	tags: ['auth'],
	summary: 'logout',
	hidden: false,
	headers: AuthHeader
} as const;


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
		required: ['username', 'password'],
		properties: {
			username: UsernameSchema,
			password: PasswordSchema,
		},
	},
	response: {
		200: {
			type: 'object',
			properties: {
				enablejwt: { type: 'string' },
				tfa: { type: 'boolean' }
			}
		},
		401: {
			type: 'object',
			properties: { message: { type: 'string' } }
		}
	}
} as const;
export type registerBody = FromSchema<typeof registerSchema.body>;







/*====================== 2FA_ROUTES ================================*/

export const enable_TFA_Schema = {
	description: 'post request enable 2fa',
	tags: ['2FA'],
	summary: 'sends a post request to enable 2fa auth',
	hidden: false,
	headers: {
		type: 'object',
		properties: {
			enablejwt: { type: 'string' }
		}
	},
	body: {},
	response: {
		200: {
			type: 'object',
			properties: {
				verifyjwt: { type: 'string'},
					qr: { type: 'string' } 
				}
		}
	}
} as const ;
export type enable_TFA_body = FromSchema<typeof enable_TFA_Schema.body>;



export const disable_TFA_Schema = {
	description: 'post request to disable the 2fa auth.',
	tags: ['2FA'],
	summary: 'disable 2fa auth',
	hidden: false,
	headers: AuthHeader,
	body: {
		type: 'object',
		properties: {
			username: UsernameSchema,
			password: PasswordSchema,
			tfa_token: TFA_token_schema,
		},
		required: ['username', 'password', 'tfa_token']
	},
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
export type disable_TFA_body = FromSchema<typeof disable_TFA_Schema.body>;

export const verifyTFASchema = {
	description: 'post request to verify 2fa token, needs a tmp jwt or real jwt, issues a new jwt',
	tags: ['2FA'],
	summary: 'verify 2fa token',
	hidden: false,
	headers: {
		type: 'object',
		properties: {
			verifyjwt: { type: 'string' }
		}
	},
	body: {
		type: 'object',
		properties: {
			tfa_token: TFA_token_schema,
		},
		required: ['tfa_token']
	},
	response: {
		200: {
			type: 'object',
			properties: { message: { type: 'string' } }
		},
		400: {
			type: 'object',
			properties: { message: { type: 'string' } }
		},
		401: {
			type: 'object',
			properties: { message: { type: 'string' } }
		},
	}
} as const;
export type verifyTFAbody = FromSchema<typeof verifyTFASchema.body>;






// export const disable2faSchema = {
// 	//swagger
// 	description: 'TwoFA_schema',
// 	tags: ['2FA'],
// 	summary: '',
// 	operationId: '12345',
// 	hidden: false,
// 	//query====
// 	querystring: false,
// 	//headers==
// 	headers: {
// 		type: 'object',
// 		properties: {
// 			Authorization: { type: 'string', pattern: '^Bearer.+' }
// 		},
// 		required: ['Authorization']
// 	},
// 	//body====
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
// 	//response=
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