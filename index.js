'use strict'

const parse = require('acorn').parse
const generate = require('escodegen').generate
const vm = require('vm')
const stack = require('stack-trace')

const instrument = require('./lib/instrument')
const defaultSandbox = require('./lib/sandbox')



const inspect = (code, sandbox = defaultSandbox) => {
	const {
		ast, expressions, nameOfSpy, nameOfNow, nameOfLater
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

	const now = (fn, i, ...args) => {
		if (fn === setTimeout) return
		return spy(fn(...args), i)
	}

	const later = (calls) => {
		calls
		.filter((call) => call.fn === setTimeout)
		.sort((call1, call2) => call1.args[1] - call2.args[1]) // sort by delay
		.forEach(({args}) => args[0]()) // call callback synchronously
	}



	sandbox = Object.assign({}, sandbox, {
		[nameOfSpy]: spy, [nameOfNow]: now, [nameOfLater]: later,
		global: sandbox, GLOBAL: sandbox
	})
	const instrumented = generate(ast)

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
