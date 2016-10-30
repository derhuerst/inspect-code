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

const nameFinder = (identifiers) => {
	const added = []
	return () => {
		let id = '_' + randomString()
		while (identifiers.includes(id) || added.includes(id))
			id = '_' + randomString()
		added.push(id)
		return id
	}
}



const instrument = (code, ast) => {
	const newName = nameFinder(identifiers(ast))
	const source = (node) => code.slice(node.range[0], node.range[1])

	const anchorsToAdd = []
	const addAnchor = (name) => anchorsToAdd.push(_.identifier(name))
	const deferredCalls = []

	// todo: would this be a use case for Symbols?
	const nameOfSpy = newName()
	const nameOfNow = newName()
	const nameOfLater = newName()



	let i = 0
	const expressions = []

	ast = walk(ast, {
		enter: (n) => {},
		leave: (n) => {
			const start = {line: n.loc.start.line - 1, column: n.loc.start.column}
			const end = {line: n.loc.end.line - 1, column: n.loc.end.column}

			if (_.isNamedCallExpression(n)) {
				const fnName = newName()
				addAnchor(fnName)
				const fn = _.assignment(_.identifier(fnName), n.callee)

				const argNames = n.arguments.map(newName)
				argNames.forEach(addAnchor)
				const args = n.arguments.map((arg, i) =>
					_.assignment(_.identifier(argNames[i]), arg))

				expressions[i] = {start, end, code: source(n)}
				const now = _.call(_.identifier(nameOfNow),
					[_.identifier(fnName), _.literal(i)]
					.concat(argNames.map(_.identifier)))
				deferredCalls.push({fn: fnName, args: argNames})
				i++

				n = {type: 'SequenceExpression', expressions: [fn, ...args, now]}
			}

			else if (_.isPrimitiveExpression(n)) {
				expressions[i] = {start, end, code: source(n)}
				n = _.call(_.identifier(nameOfSpy), [n, _.literal(i)])
				i++
			}

			else if (n.type === 'Program') {
				let body = n.body

				if (anchorsToAdd.length > 0)
					body = [].concat(_.declaration(anchorsToAdd), body)

				if (deferredCalls.length > 0)
					body = body.concat({
						type: 'ExpressionStatement',
						expression: _.call(_.identifier(nameOfLater), [
							_.array(deferredCalls.map((call) => _.object({
								fn: _.identifier(call.fn),
								args: _.array(call.args.map(_.identifier))
							})))
						])
					})

				n = Object.assign({}, n, {body})
			}

			return n
		}
	})

	return {ast, expressions, nameOfSpy, nameOfNow, nameOfLater}
}

module.exports = instrument
