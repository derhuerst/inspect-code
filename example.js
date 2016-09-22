'use strict'

const inspect = require('./index')



const code = `\
const a = x => x - 1
const b = [1, 2, 3]
const c = b[a(b.length)]
c + 1`

const expressions = inspect(code)

for (let exp of expressions) {
	console.log(code.substring(exp.from, exp.to + 1).trim())
	for (let value of exp.values) console.log('\t', value)
}
