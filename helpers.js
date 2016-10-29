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

const isBlockStatement = (node) =>
	node.type === 'BlockStatement'

const isFunction = (node) =>
	/FunctionExpression$/.test(node.type)
	|| node.type === 'FunctionDeclaration'

const enclosingFunctionBlock = (n) => {
	let result = null
	while (n.parent) {
		n = n.parent
		if (isBlockStatement(n) && n.parent && isFunction(n.parent)) {
			result = n
			break
		}
	}
	return result
}



module.exports = {
	unusedIdentifier,
	isNamedCallExpression,
	isPrimitiveExpression,
	isBlockStatement,
	isFunction,
	enclosingFunctionBlock
}
