'use strict'

const falafel = require('falafel')
const vm = require('vm')



const inspect = (code) => {
	const data = []
	const hook = (x, i) => {
		if (data[i]) data[i].values.push(x);
		return x
	}

	let i = 0
	const tapped = falafel(code, {ecmaVersion: 6, ranges: true}, (n) => {
		if (/Expression$/.test(n.type)) {
			data[i] = {from: n.range[0], to: n.range[1], values: []}
			n.update('_((' + n.source() + '),' + i + ')')
			i++
		}
	})

	const ctx = new vm.createContext({_: hook})
	const script = new vm.Script(tapped)
	script.runInContext(ctx)

	return data
}

module.exports = inspect
