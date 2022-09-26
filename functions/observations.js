// const { URL } = require('url')
const fetch = require('node-fetch')
exports.handler = async (event) => {
	const { regioncode, back } = event.queryStringParameters
	// console.log('EBIRD_TOKEN', process.env.EBIRD_TOKEN)
	const requestOptions = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'X-eBirdApiToken': 'ouetpkd1ih6j'
		}
	}

	// @ts-ignore
	const hotspots = await fetch(
		`https://api.ebird.org/v2/data/obs/${regioncode}/recent?fmt=json&back=${back}`,
		requestOptions
	)
		.then(response => {
			return response.status === 200 ?
				response.json() :
				`error code: ${response.status}`
		})
		.catch(error => {
			return error
		})

	return {
		statusCode: 200,
		body: JSON.stringify(hotspots)
	}
}
