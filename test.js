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
	t.plan(9)
	const d = inspect(code)

	t.deepEqual(d[0], [31, 36, 2])
	t.equal(d[1][0], 26)
	t.equal(d[1][1], 36)
	t.equal(typeof d[1][2], 'function')
	t.deepEqual(d[2], [48, 57, [1, 2, 3]])
	t.deepEqual(d[3], [73, 81, 3])
	t.deepEqual(d[4], [71, 82, 2])
	t.deepEqual(d[5], [69, 83, 3])
	t.deepEqual(d[6], [85, 90, 4])
})
