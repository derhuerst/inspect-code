#!/usr/bin/env node
'use strict'

const test = require('tape')

const inspect = require('./index')



const code = `
	'use strict'
	const a = x => x - 1
	const b = [1, 2, 3]
	const c = b[a(b.length)]
	c + 1`



test('fails on syntax error', (t) => {
	t.plan(1)
	t.throws(() => {
		inspect(`const const a`)
	}, /^SyntaxError/, 'invalid error')
})

test('fails on reference error', (t) => {
	t.plan(1)
	t.throws(() => {
		inspect(`'use strict'\na + 3`)
	}, /^ReferenceError/, 'invalid error')
})

test('returns an array', (t) => {
	t.plan(1)
	t.ok(Array.isArray(inspect(code)))
})

test('returns the position of each expression', (t) => {
	t.plan(6)
	const d = inspect(code)

	t.deepEqual(d[0], {from: 31, to: 36, values: [2]})
	t.deepEqual(d[2], {from: 48, to: 57, values: [[1, 2, 3]]})
	t.deepEqual(d[3], {from: 73, to: 81, values: [3]})
	t.deepEqual(d[4], {from: 71, to: 82, values: [2]})
	t.deepEqual(d[5], {from: 69, to: 83, values: [3]})
	t.deepEqual(d[6], {from: 85, to: 90, values: [4]})
})
