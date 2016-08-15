'use strict'

const falafel = require('falafel')
const vm = require('vm')



const inspect = (code) => {
	const data = []
	const hook = (x) => {data.push(x); return x}

	const tapped = falafel(code, {ecmaVersion: 6, ranges: true}, (n) => {
		if (/Expression$/.test(n.type)) {
			if (n.type === 'SequenceExpression')
				n.update('_((' + n.source() + '))')
			else n.update('_(' + n.source() + ')')
		}
	})

	const ctx = new vm.createContext({_: hook})
	const script = new vm.Script(tapped)
	try {
		script.runInContext(ctx)
	} catch (err) {return err}

	return data
}

module.exports = inspect
