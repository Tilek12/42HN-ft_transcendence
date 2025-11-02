import { FromSchema } from 'json-schema-to-ts';


export const PresenceWebsocketSchema = {
	//swagger
	description: 'start a presence websocket',
	tags: ['websocket'],
	summary: 'presence ws',
	hidden: false,
	//query
	// querystring: false,
	// headers: {
	// 	type: 'object',
	// 	properties: {
	// 		Authorization: BearerSchema // add only when updating logic with cookies
	// 	},
	// 	required: ['Authorization']
	// },
} as const;

export const GameWebsocketSchema = {
	//swagger
	description: 'start a game websocket',
	tags: ['websocket'],
	summary: 'game ws',
	hidden: false,
	// query
		querystring: {
		type: 'object',
		properties: {
			mode:	{ type: 'string', pattern: '^[a-z]{4,10}$' }, // gamemode = "solo" | "duel" | "tournament"
			// size:	{ type: 'integer', minimum: 4, maximum: 8 }, // size only 4 or 8
			// id:		{ type: 'integer'},
		},
		required: ['mode']
	// },
	// headers: {
	// 	type: 'object',
	// 	properties: {
	// 		Authorization: BearerSchema // add only when updating logic with cookies
	// 	},
	// 	required: ['Authorization']
	},

} as const;

export type GameWebsocketQuery = FromSchema<typeof GameWebsocketSchema.querystring>;

