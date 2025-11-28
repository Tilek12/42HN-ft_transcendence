import { FromSchema } from 'json-schema-to-ts';

import { AuthHeader } from '../../auth/schemas'

export const PresenceWebsocketSchema = {
	//swagger
	description: 'start a presence websocket',
	tags: ['websocket'],
	summary: 'presence ws',
	hidden: false,
	headers: AuthHeader

} as const;

export const GameWebsocketSchema = {
	//swagger
	description: 'start a game websocket',
	tags: ['websocket'],
	summary: 'game ws',
	hidden: false,
	headers: AuthHeader,
	// query
	querystring: {
		type: 'object',
		required: ['mode'],
		properties: {
			mode:	{ type: 'string', pattern: '^[a-z]{4,10}$' }, // gamemode = "solo" | "duel" | "tournament"
			// size:	{ type: 'integer', minimum: 4, maximum: 8 }, // size only 4 or 8
			// id:		{ type: 'integer'},
			}
		},

} as const;

export type GameWebsocketQuery = FromSchema<typeof GameWebsocketSchema.querystring>;

export const TournamentWebsocketSchema = {
	//swagger
	description: 'start a game websocket',
	tags: ['websocket'],
	summary: 'game ws',
	hidden: false,
	headers: AuthHeader,
	querystring: {
		type: 'object',
		required: ['action', 'mode'],
		properties: {
			action:	{ type: 'string', enum:['create', 'join']},
			id:		{ type: 'string'},
			size:	{ type: 'number', enum: [4, 8]},
			mode:	{ type: 'string', enum:['local','online']},
			names:	{ type: 'array', items:{type:'string'}},
		},
	},
} as const;

export type TournamentWebsocketQuery = FromSchema<typeof TournamentWebsocketSchema.querystring>;

