const { URL } = require('url')
const fetch = require('node-fetch')

exports.handler = async (event) => {

	const { regioncode, back } = event.queryStringParameters

	const ebirdApi = new URL(`https://api.ebird.org/v2/ref/hotspot/${regioncode}`)
	ebirdApi.searchParams.set('fmt', 'json')
	ebirdApi.searchParams.set('back', back)

	// @ts-ignore
	const hotspots = await fetch(ebirdApi, { method: 'GET', redirect: 'follow' })
		.then(response => {
			if (response.status === 200) return response.json()
			else return {
				responseType: 'error',
				statusCode: response.status,
				body: response.statusText
			}
		})
		// reformat response to geoJson for Mapbox
		.then(data => {
			if (data.responseType === 'error') return data
			const geoJson = data.map(spot => {
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
			return geoJson
		})
		.catch(error => {
			return error
		})

	return {
		statusCode: 200,
		body: JSON.stringify(hotspots)
	}
}
