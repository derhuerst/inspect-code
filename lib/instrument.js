'use strict'

const identifiers = require('javascript-idents').all
const walk = require('estraverse').replace

const _ = require('./ast-helpers')



const randomString = (l = 3) => {
	let id = (Math.random() * 26 + 10 | 0).toString(36)
	for (let i = 1; i < l; i++)
		id += (Math.random() * 26 | 0).toString(36)
	return id
}

const unusedName = (identifiers) => {
	let id = '_' + randomString()
	while (identifiers.includes(id))
		id = '_' + randomString()
	return id
}



const instrument = (code, ast) => {
	const source = (node) => code.slice(node.range[0], node.range[1])

	// todo: would this be a use case for Symbols?
	const nameOfSpy = unusedName(identifiers(ast))

	let i = 0
	const expressions = []

	ast = walk(ast, {
		enter: (n) => {},
		leave: (n) => {
			const start = {line: n.loc.start.line - 1, column: n.loc.start.column}
			const end = {line: n.loc.end.line - 1, column: n.loc.end.column}

			if (_.isPrimitiveExpression(n)) {
				expressions[i] = {start, end, code: source(n)}
				n = _.call(_.identifier(nameOfSpy), [n, _.literal(i)])
				i++
			}

			return n
		}
	})

	return {ast, expressions, nameOfSpy}
}

module.exports = instrument
