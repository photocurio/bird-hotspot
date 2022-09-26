// const { URL } = require('url')
const fetch = require('node-fetch')
exports.handler = async (event) => {
	const { regioncode, back } = event.queryStringParameters
	const requestOptions = {
		method: 'GET',
		redirect: 'follow'
	}

	// @ts-ignore
	const hotspots = await fetch(
		`https://api.ebird.org/v2/ref/hotspot/${regioncode}?fmt=json&back=${back}`,
		requestOptions
	)
		.then(response => {
			if (response.status === 200) return response.json()
			else return {
				responseType: 'error',
				statusCode: response.status,
				body: response.statusText
			}
		})
		.then(data => {
			if (data.responseType === 'error') return data
			const geoJason = data.map(spot => {
				return {
					geometry: {
						type: 'Point',
						coordinates: [
							spot.lng,
							spot.lat
						]
					},
					type: 'Feature',
					properties: {
						locId: spot.locId,
						locName: spot.locName,
						countryCode: spot.countryCode,
						subnational1Code: spot.subnational1Code,
						subnational2Code: spot.subnational2Code
					}
				}
			})
			return geoJason
		})
		.catch(error => {
			return error
		})

	return {
		statusCode: 200,
		body: JSON.stringify(hotspots)
	}
}
