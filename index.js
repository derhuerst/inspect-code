'use strict'

const esprima = require('esprima')
const uniq = require('lodash.uniq')
const filter = require('estools/filter')
const vm = require('vm')



const letters = 'abcdefghijklmnopqrstuvwxyz'
const identifier = (blacklist) => {
	while (true) {
		let name = '_', i = 2
		while (i-- > 0) name += letters[Math.random() * 25 | 0]
		if (blacklist.indexOf(name) === -1) return name
	}
}



const inspect = (code, sandbox = {}) => {
	const parsed = esprima.parse(code, {range: true})
		.body.map((e) =>
			[e.range[0], e.range[1], code.substring(e.range[0], e.range[1] + 1)])

	const identifiers = uniq(
		filter(parsed, {type: 'Identifier'})
		.map((node) => node.name))
	const id = identifier(identifiers)

	const tapped = parsed
		.map((exp) => id + '(' + exp[2] + ')')
		.join(';')

	let i = 0
	const hook = (result) => {
		parsed[i].push(result)
		i++
	}

	sandbox = Object.assign({}, sandbox, {[id]: hook})
	const ctx = new vm.createContext(sandbox)

	const script = new vm.Script(tapped)
	script.runInContext(ctx)

	return parsed
}

module.exports = inspect
