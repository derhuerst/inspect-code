'use strict'

const inspect = require('.')

const code = `\
const a = x => x - 1
const b = [1, 2, 3]
const c = b[a(b.length)]
c + 1`

console.log(inspect(code))
