# *inspect-code*

**Run code and get every statement's value.**

*inspect-code* takes a string of code, instruments it to spy on every expression, and runs it inside [Node's vm](https://nodejs.org/api/vm.html) module. It returns every expression, with its position and values.

[![npm version](https://img.shields.io/npm/v/inspect-code.svg)](https://www.npmjs.com/package/inspect-code)
[![build status](https://img.shields.io/travis/derhuerst/inspect-code.svg)](https://travis-ci.org/derhuerst/inspect-code)
[![dependency status](https://img.shields.io/david/derhuerst/inspect-code.svg)](https://david-dm.org/derhuerst/inspect-code)
[![dev dependency status](https://img.shields.io/david/dev/derhuerst/inspect-code.svg)](https://david-dm.org/derhuerst/inspect-code#info=devDependencies)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/inspect-code.svg)


## Installing

```shell
npm install inspect-code
```


## Usage

Imagine you want to analyze the following piece of code.

```js
const code = `
	'use strict'
	const a = x => x - 1
	const b = [1, 2, 3]
	const c = b[a(b.length)]
	c + 1`
```

`inspect` will return a list of expressions.

```js
const inspect = require('./index')
const expressions = inspect(code)

for (let exp of expressions) {
	console.log(code.substring(exp.from, exp.to + 1).trim())
	for (let value of exp.values) console.log('\t', value)
}
```

```
x - 1
	2
x => x - 1
	x => _((x - 1),0)
[1, 2, 3]
	[ 1, 2, 3 ]
b.length)
	3
a(b.length)]
	2
b[a(b.length)]
	3
c + 1
	4
```


## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/derhuerst/inspect-code/issues).
