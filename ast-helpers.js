'use strict'

const isNamedCallExpression = (node) =>
	node.type === 'CallExpression'
	&& node.callee.type === 'Identifier'

const isPrimitiveExpression = (node) =>
	/Expression$/.test(node.type)
	&& !(/FunctionExpression$/.test(node.type))



const identifier = (name) => ({type: 'Identifier', name})

const literal = (value) => ({type: 'Literal', value, raw: value + ''})

const declaration = (ids, kind = 'let') => ({
	type: 'VariableDeclaration', kind,
	declarations: ids.map((id) => ({
		type: 'VariableDeclarator', id, init: null
	}))
})

const assignment = (left, right, operator = '=') => ({
	type: 'AssignmentExpression',
	left, right, operator
})

const call = (id, args) => ({
	type: 'CallExpression',
	callee: id, arguments: args
})

const array = (elements) => ({
	type: 'ArrayExpression', elements
})

const object = (props) => ({
	type: 'ObjectExpression',
	properties: Object.entries(props).map(([key, value]) => ({
		type: 'Property', key: identifier(key), value,
		method: false, computed: false, shorthand: false, kind: 'init'
	}))
})



module.exports = {
	isNamedCallExpression,
	isPrimitiveExpression,

	identifier,
	literal,
	declaration,
	assignment,
	call,
	array,
	object
}
