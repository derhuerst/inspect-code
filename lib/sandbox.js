'use strict'

const sandbox = () => {
	const sandbox = {
		Date,
		Buffer,
		setTimeout, clearTimeout,
		setInterval, clearInterval,
		setImmediate, clearImmediate
	}
	sandbox.global = sandbox
	sandbox.GLOBAL = sandbox

	return sandbox
}

module.exports = sandbox
