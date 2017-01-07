'use strict'

const parse = require('acorn').parse
const generate = require('escodegen').generate
const vm = require('vm')
const stack = require('stack-trace')

const instrument = require('./lib/instrument')
const defaultSandbox = require('./lib/sandbox')



const inspect = (code, sandbox = defaultSandbox) => {
	const {
		ast, expressions, nameOfSpy
	} = instrument(code, parse(code, {
		ecmaVersion: 6, ranges: true, locations: true
	}))



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



	const ctx = {[nameOfSpy]: spy}
	Object.assign(ctx, {global: ctx, GLOBAL: ctx}, sandbox)
	const instrumented = generate(ast)

	try {
		const script = new vm.Script(instrumented, {filename: 'inspect-code'})
		script.runInContext(new vm.createContext(ctx))
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
