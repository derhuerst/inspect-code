#!/usr/bin/env node
'use strict'

const test = require('tape')
const rEqual = require('is-roughly-equal')
const acorn = require('acorn')
const falafel = require('falafel')

const {enclosingFunctionBlock} = require('./helpers')
const inspect = require('./index')



const parse = (code) =>
	acorn.parse(code, {ecmaVersion: 6})

const walk = (code, selector, fn) =>
	falafel(code, {parser: {parse}}, (node) => {
		if (selector(node)) fn(node)
	})

const code = `\
const a = x => x - 1
const b = [5, 6, 7]
const c = b[a(b.length)]
c + 1`



test('enclosingFunctionBlock', (t) => {
	t.plan(3)
	const code = 'const x = 3;\n() => { x + 1 }'
	const isTarget = (n) =>
		/Statement$/.test(n.type) && n.source().trim() === 'x + 1'

	walk(code, isTarget, (n) => {
		const block = enclosingFunctionBlock(n)
		const fn = block.parent
		t.strictEqual(block.type, 'BlockStatement')
		t.strictEqual(block.source().trim(), '{ x + 1 }')
		t.strictEqual(fn.type, 'ArrowFunctionExpression')
	})
})

test('fails on syntax error', (t) => {
	t.plan(4)

	t.throws(() => {
		inspect(`const const a`)
	}, /^SyntaxError/, 'invalid error')
	try { inspect(`const const a`) }
	catch (err) {
		t.ok(err.loc)
		t.equal(err.loc.line, 1)
		t.equal(err.loc.column, 6)
	}
})

test('fails on reference error', (t) => {
	t.plan(4)

	const [err] = inspect(`'use strict'\na`)
	t.equal(err.name, 'ReferenceError', 'invalid error')
	t.ok(err.loc)
	t.equal(err.loc.line, 2)
	t.equal(err.loc.column, 1)
})

test('returns an array', (t) => {
	t.plan(1)
	t.ok(Array.isArray(inspect(code)))
})

test('extracts all expressions correctly', (t) => {
	t.plan(6 * 3)
	const d = inspect(code)

	t.equal(d[0].code.trim(), `[5, 6, 7]`)
	t.deepEqual(d[0].start, {line: 1, column: 10})
	t.deepEqual(d[0].end,   {line: 1, column: 19})

	t.equal(d[1].code.trim(), `b.length`)
	t.deepEqual(d[1].start, {line: 2, column: 14})
	t.deepEqual(d[1].end,   {line: 2, column: 22})

	t.equal(d[2].code.trim(), `x - 1`)
	t.deepEqual(d[2].start, {line: 0, column: 15})
	t.deepEqual(d[2].end,   {line: 0, column: 20})

	t.equal(d[3].code.trim(), `a(b.length)`)
	t.deepEqual(d[3].start, {line: 2, column: 12})
	t.deepEqual(d[3].end,   {line: 2, column: 23})

	t.equal(d[4].code.trim(), `b[a(b.length)]`)
	t.deepEqual(d[4].start, {line: 2, column: 10})
	t.deepEqual(d[4].end,   {line: 2, column: 24})

	t.equal(d[5].code.trim(), `c + 1`)
	t.deepEqual(d[5].start, {line: 3, column: 0})
	t.deepEqual(d[5].end,   {line: 3, column: 5})
})

test('collects all values correctly', (t) => {
	t.plan(6)
	const d = inspect(code)

	t.deepEqual(d[0].value, [5, 6, 7])
	t.deepEqual(d[1].value, 3)
	t.deepEqual(d[2].value, 2)
	t.deepEqual(d[3].value, 2)
	t.deepEqual(d[4].value, 7)
	t.deepEqual(d[5].value, 8)
})

test('collects timestamps', (t) => {
	t.plan(6 + 6 - 1)
	const now = Date.now()
	const d = inspect(code)

	d.forEach((v, i) => {
		t.ok(rEqual(100, v.when, now))
		if (d[i - 1])
			t.ok(rEqual(100, v.when, d[i - 1].when))
	})
})
