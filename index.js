'use strict'

const astw = require('astw')
const falafel = require('falafel')
const vm = require('vm')



const letters = 'abcdefghijklmnopqrstuvwxyz'
const identifier = (blacklist) => {
	while (true) {
		let name = '_', i = 2
		while (i-- > 0) name += letters[Math.random() * 25 | 0]
		if (blacklist.indexOf(name) === -1) return name
	}
}

const identifiers = (code) => {
	const ids = []
	astw(code)((node) => {
		if (node.type === 'Identifier' && ids.indexOf(node.name) === -1)
			ids.push(node.name)
	})
	return ids
}



const inspect = (code) => {
	const data = []
	const hookFn = (x) => {data.push(x); return x}
	const hookName = identifier(identifiers(code))

	const tapped = falafel(code, {ecmaVersion: 6}, (n) => {
		if (n.type === 'VariableDeclarator') {
			if (n.init.type === 'SequenceExpression')
				n.init.update(hookName + '((' + n.init.source() + '))')
			else n.init.update(hookName + '(' + n.init.source() + ')')
		} else if (n.type === 'AssignmentExpression') {
			n.update(hookName + '(' + n.source() + ')')
		} else if (n.type === 'ExpressionStatement') {
			n.update(hookName + '(' + n.source() + ')')
		}
	})

	const ctx = new vm.createContext({[hookName]: hookFn})
	const script = new vm.Script(tapped)
	try {
		script.runInContext(ctx)
	} catch (err) {return err}

	return data
}

module.exports = inspect
