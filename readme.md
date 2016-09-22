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
const code = `\
const a = x => x - 1
const b = [1, 2, 3]
const c = b[a(b.length)]
c + 1`
```

`inspect` will return a list of expressions.

```js
const inspect = require('./index')
console.log(inspect(code))
```

```
[
	{
		start:  { line: 0, column: 15 },
		end:    { line: 0, column: 20 },
		code:   'x - 1',
		values: [ 2 ]
	}, {
		start:  { line: 0, column: 10 },
		end:    { line: 0, column: 20 },
		code:   'x => x - 1',
		values: [ x => x - 1 ]
	}, {
		start:  { line: 1, column: 10 },
		end:    { line: 1, column: 19 },
		code:   '[1, 2, 3]',
		values: [ [ 1, 2, 3 ] ]
	}, {
		start:  { line: 2, column: 14 },
		end:    { line: 2, column: 22 },
		code:   'b.length',
		values: [ 3 ]
	}, {
		start:  { line: 2, column: 12 },
		end:    { line: 2, column: 23 },
		code:   'a(b.length)',
		values: [ 2 ]
	}, {
		start:  { line: 2, column: 10 },
		end:    { line: 2, column: 24 },
		code:   'b[a(b.length)]',
		values: [ 3 ]
	}, {
		start:  { line: 3, column: 0 },
		end:    { line: 3, column: 5 },
		code:   'c + 1',
		values: [ 4 ]
	}
]
```


## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/derhuerst/inspect-code/issues).
