#!/usr/bin/env node
'use strict'

const Benchmark = require('benchmark')
const vm = require('vm')

const inspect = require('.')
const sandbox = require('./lib/sandbox')

new Benchmark.Suite()

.add('vanilla vm.runInNewContext', () => {

	vm.runInNewContext(`
		const a = x => x - 1
		const b = [1, 2, 3]
		const c = b[a(b.length)]
		c + 1
	`, Object.assign({}, sandbox), {filename: 'inspect-code'})
})

.add('sync code', () => {
	inspect(`
		const a = x => x - 1
		const b = [1, 2, 3]
		const c = b[a(b.length)]
		c + 1
	`)
})

.add('async code', () => {
	inspect(`
		let a = 1
		setTimeout(() => {
			a += 3
		}, 5)
		a += 2
	`)
})

.on('cycle', (e) => console.log('' + e.target))
.run({async: true})
