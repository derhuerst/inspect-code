'use strict'

const unusedIdentifier = (identifiers) => {
	let id = identifiers[0] || '_'
	while (identifiers.includes(id)) {
		id = ''
		for (let i = 0; i < 5; i++)
			id += (Math.random() * 26 + 10 | 0).toString(36)
	}
	return id
}

const isNamedCallExpression = (node) =>
	node.type === 'CallExpression'
	&& node.callee.type === 'Identifier'

const isPrimitiveExpression = (node) =>
	/Expression$/.test(node.type)
	&& !(/FunctionExpression$/.test(node.type))



module.exports = {
	unusedIdentifier,
	isNamedCallExpression,
	isPrimitiveExpression
}
