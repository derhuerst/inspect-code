#!/usr/bin/env node
'use strict'

const test = require('tape')

const inspect = require('./index')



const code = `
	const a = x => x - 1
	const b = [5, 6, 7]
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

test('returns the range of each expression', (t) => {
	t.plan(6 * 2)
	const d = inspect(code)

	t.deepEqual(d[0].from, 17)
	t.deepEqual(d[0].to,   22)

	t.deepEqual(d[2].from, 34)
	t.deepEqual(d[2].to,   43)

	t.deepEqual(d[3].from, 59)
	t.deepEqual(d[3].to,   67)

	t.deepEqual(d[4].from, 57)
	t.deepEqual(d[4].to,   68)

	t.deepEqual(d[5].from, 55)
	t.deepEqual(d[5].to,   69)

	t.deepEqual(d[6].from, 71)
	t.deepEqual(d[6].to,   76)
})

test('returns the position of each expression', (t) => {
	t.plan(6 * 2)
	const d = inspect(code)

	t.deepEqual(d[0].start, {line: 1, column: 16})
	t.deepEqual(d[0].end,   {line: 1, column: 21})

	t.deepEqual(d[2].start, {line: 2, column: 11})
	t.deepEqual(d[2].end,   {line: 2, column: 20})

	t.deepEqual(d[3].start, {line: 3, column: 15})
	t.deepEqual(d[3].end,   {line: 3, column: 23})

	t.deepEqual(d[4].start, {line: 3, column: 13})
	t.deepEqual(d[4].end,   {line: 3, column: 24})

	t.deepEqual(d[5].start, {line: 3, column: 11})
	t.deepEqual(d[5].end,   {line: 3, column: 25})

	t.deepEqual(d[6].start, {line: 4, column: 1})
	t.deepEqual(d[6].end,   {line: 4, column: 6})
})

test('collects values of each expression', (t) => {
	t.plan(6 + 1)
	const d = inspect(code)

	t.deepEqual(d[0].values, [2])
	t.equal(typeof d[1].values[0], 'function')
	t.deepEqual(d[2].values, [[5, 6, 7]])
	t.deepEqual(d[3].values, [3])
	t.deepEqual(d[4].values, [2])
	t.deepEqual(d[5].values, [7])
	t.deepEqual(d[6].values, [8])
})
