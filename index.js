'use strict'

const identifiers = require('javascript-idents').all
const acorn = require('acorn')
const walk = require('estraverse').replace
const escodegen = require('escodegen')
const vm = require('vm')
const stack = require('stack-trace')

const tools = require('./ast-helpers')
const defaultSandbox = require('./default-sandbox')



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



const inspect = (code, sandbox = defaultSandbox) => {
	let ast = acorn.parse(code, {ecmaVersion: 6, ranges: true, locations: true})

	const newName = nameFinder(identifiers(ast))
	const source = (node) => code.slice(node.range[0], node.range[1])

	const anchorsToAdd = []
	const addAnchor = (name) => anchorsToAdd.push(tools.identifier(name))
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

			if (tools.isNamedCallExpression(n)) {
				const fnName = newName()
				addAnchor(fnName)
				const fn = tools.assignment(tools.identifier(fnName), n.callee)

				const argNames = n.arguments.map(newName)
				argNames.forEach(addAnchor)
				const args = n.arguments.map((arg, i) =>
					tools.assignment(tools.identifier(argNames[i]), arg))

				expressions[i] = {start, end, code: source(n)}
				const now = tools.call(tools.identifier(nameOfNow), [
						tools.identifier(fnName),
						tools.literal(i),
						argNames.map(tools.identifier)
				])
				deferredCalls.push({fn: fnName, args: argNames})
				i++

				n = {type: 'SequenceExpression', expressions: [fn, ...args, now]}
			}

			else if (tools.isPrimitiveExpression(n)) {
				expressions[i] = {start, end, code: source(n)}
				n = tools.call(tools.identifier(nameOfSpy), [n, tools.literal(i)])
				i++
			}

			else if (n.type === 'Program') {
				let body = n.body

				if (deferredCalls.length > 0)
					body = body.concat({
						type: 'ExpressionStatement',
						expression: tools.call(tools.identifier(nameOfLater), [
							tools.array(deferredCalls.map((call) => tools.object({
								fn: tools.identifier(call.fn),
								args: tools.array(call.args.map(tools.identifier))
							})))
						])
					})

				if (anchorsToAdd.length > 0)
					body = [].concat(tools.declaration(anchorsToAdd), body)

				n = Object.assign({}, n, {body})
			}

			return n
		}
	})

	const instrumented = escodegen.generate(ast)



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
