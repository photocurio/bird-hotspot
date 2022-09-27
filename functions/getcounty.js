const { URL } = require('url')
const fetch = require('node-fetch')
exports.handler = async (event) => {
	const { lng, lat } = event.queryStringParameters
	if (!lng || !lat) return {
		statusCode: 404,
		body: 'not found'
	}
	const fccApi = new URL('https://geo.fcc.gov/api/census/block/find')
	fccApi.searchParams.set('latitude', lat)
	fccApi.searchParams.set('longitude', lng)
	fccApi.searchParams.set('showall', 'false')
	fccApi.searchParams.set('format', 'json')

	// @ts-ignore
	const county = await fetch(fccApi)
		.then(res => res.json())

	return {
		statusCode: 200,
		body: JSON.stringify(county)
	}
}
