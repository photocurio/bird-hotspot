// const { URL } = require('url')
const fetch = require('node-fetch')
exports.handler = async (event) => {
	const { locationCode, back } = event.queryStringParameters
	const requestOptions = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'X-eBirdApiToken': process.env.EBIRD_TOKEN
		}
	}

	// @ts-ignore
	const hotspots = await fetch(
		`https://api.ebird.org/v2/data/obs/${locationCode}/recent?fmt=json&back=${back}`,
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
