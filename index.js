'use strict'

const findIdentifiers = require('javascript-idents').all
const acorn = require('acorn')
const falafel = require('falafel')
const vm = require('vm')
const stack = require('stack-trace')

const defaultSandbox = require('./default-sandbox')



const unusedIdentifier = (identifiers) => {
	let id = identifiers[0] || '_'
	while (identifiers.includes(id)) {
		id = ''
		for (let i = 0; i < 5; i++)
			id += (Math.random() * 26 + 10 | 0).toString(36)
	}
	return id
}

const isPrimitiveExpression = (node) =>
	/Expression$/.test(node.type)
	&& !(/FunctionExpression$/.test(node.type))

const inspect = (code, sandbox = defaultSandbox) => {
	const ast = acorn.parse(code, {ecmaVersion: 6, ranges: true, locations: true})
	const nameOfSpy = unusedIdentifier(ast) // todo: would this be a use case for Symbols?
	const expressions = []

	let i = 0
	const instrumented = falafel(code, {
		parser: {parse: (code) => ast} // skip parsing since we already did that
	}, (n) => {
		if (isPrimitiveExpression(n)) {
			const start = {line: n.loc.start.line - 1, column: n.loc.start.column}
			const end = {line: n.loc.end.line - 1, column: n.loc.end.column}
			expressions[i] = {
				start, end, code: code.substring(n.range[0], n.range[1])
			}
			n.update(nameOfSpy + '((' + n.source() + '),' + i + ')')
			i++
		}
	})



	const results = []

	const spy = (value, i) => {
		if (expressions[i]) {
			const result = Object.create(expressions[i])
			result.value = value
			result.isException = false
			result.when = Date.now()
			results.push(result);
		}
		return value
	}

	sandbox = Object.assign({}, sandbox, {[nameOfSpy]: spy})
	sandbox.global = sandbox
	sandbox.GLOBAL = sandbox

	try {
		const script = new vm.Script(instrumented, {filename: 'inspect-code'})
		script.runInContext(new vm.createContext(sandbox))
	} catch (err) {
		if (!err.loc) {
			const f = stack.parse(err)
			if (!f || !f[0]) return data
			err.loc = {line: f[0].lineNumber, column: f[0].columnNumber}
		}
		results.push(err)
	}

	return results
}

module.exports = inspect
