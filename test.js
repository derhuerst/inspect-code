#!/usr/bin/env node
'use strict'

const test = require('tape')

const inspect = require('./index')



const code = `\
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

	t.deepEqual(d[0].from, 15)
	t.deepEqual(d[0].to,   20)

	t.deepEqual(d[2].from, 31)
	t.deepEqual(d[2].to,   40)

	t.deepEqual(d[3].from, 55)
	t.deepEqual(d[3].to,   63)

	t.deepEqual(d[4].from, 53)
	t.deepEqual(d[4].to,   64)

	t.deepEqual(d[5].from, 51)
	t.deepEqual(d[5].to,   65)

	t.deepEqual(d[6].from, 66)
	t.deepEqual(d[6].to,   71)
})

test('returns the position of each expression', (t) => {
	t.plan(6 * 2)
	const d = inspect(code)

	t.deepEqual(d[0].start, {line: 0, column: 15})
	t.deepEqual(d[0].end,   {line: 0, column: 20})

	t.deepEqual(d[2].start, {line: 1, column: 10})
	t.deepEqual(d[2].end,   {line: 1, column: 19})

	t.deepEqual(d[3].start, {line: 2, column: 14})
	t.deepEqual(d[3].end,   {line: 2, column: 22})

	t.deepEqual(d[4].start, {line: 2, column: 12})
	t.deepEqual(d[4].end,   {line: 2, column: 23})

	t.deepEqual(d[5].start, {line: 2, column: 10})
	t.deepEqual(d[5].end,   {line: 2, column: 24})

	t.deepEqual(d[6].start, {line: 3, column: 0})
	t.deepEqual(d[6].end,   {line: 3, column: 5})
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
