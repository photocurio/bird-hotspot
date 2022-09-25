const eleventySass = require("eleventy-sass")

module.exports = (config) => {
	// config.addPassthroughCopy('src/css')
	config.addPlugin(eleventySass)
	config.addPassthroughCopy('src/images')
	// config.addPassthroughCopy('src/js')

	return {
		dir: {
			input: 'src',
		},
	}
}
