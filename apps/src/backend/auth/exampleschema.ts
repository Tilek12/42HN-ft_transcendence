const exampleSchema = {
	//swagger===========================================================
	description: '',
	tags: [''],
	summary: '',
	operationId: 'default',
	hidden: false,
	//route params validation ===========================================
	params: {
		type: 'object',
		properties: {
			id: {
				type: 'string',
				description: 'user id'
			}
		},
		required: 'id'
	},
	//query===============================================================
	querystring: {
		type: 'object',
		properties: {
			key1: { type: 'string', pattern: '^[0-9]+$' },
			key2: { type: 'integer', minimum: 1, maximum: 100 }
		},
		required: ['key1']
	},
	//headers=============================================================
	headers: {
		type: 'object',
		properties: {
			'x-foo': { type: 'string' }
		},
		required: ['x-foo']
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
		}
	}
}


