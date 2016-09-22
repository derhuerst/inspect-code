'use strict'

const acorn = require('acorn')
const walk = require('acorn/dist/walk')
const falafel = require('falafel')
const vm = require('vm')



// todo: put this in a module!
const findIdentifiers = (ast) => {
	const identifiers = []
	walk.simple(ast, {
		FunctionDeclaration: (node) => identifiers.push(node.id.name),
		VariableDeclarator: (node) => identifiers.push(node.id.name),
		Identifier: (node) => identifiers.push(node.name)
	})
	return identifiers
}

const unusedIdentifier = (ast) => {
	const identifiers = findIdentifiers(ast)
	let id = '_'
	while (identifiers.includes(id)) {
		id = ''
		for (let i = 0; i < 5; i++)
			id += (Math.random() * 26 + 10 | 0).toString(36)
	}
	return id
}

const inspect = (code) => {
	const ast = acorn.parse(code, {ecmaVersion: 6, ranges: true, locations: true})

	const data = []
	const spy = (x, i) => {
		if (data[i]) data[i].values.push(x);
		return x
	}
	const nameOfSpy = unusedIdentifier(ast)

	let i = 0
	// skip parsing since we already did that
	const parser = {parse: (code) => ast}
	const instrumented = falafel(code, {parser}, (n) => {
		if (/Expression$/.test(n.type)) {
			const start = {line: n.loc.start.line - 1, column: n.loc.start.column}
			const end = {line: n.loc.end.line - 1, column: n.loc.end.column}
			data[i] = {
				start, end,
				code: code.substring(n.range[0], n.range[1]),
				values: []
			}
			n.update(nameOfSpy + '((' + n.source() + '),' + i + ')')
			i++
		}
	})

	const ctx = new vm.createContext({[nameOfSpy]: spy})
	const script = new vm.Script(instrumented)
	script.runInContext(ctx)

	return data
}

module.exports = inspect
