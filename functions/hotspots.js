const { URL } = require('url')
const fetch = require('node-fetch')
const { Redis } = require('@upstash/redis')
exports.handler = async (event) => {

	const { regioncode, back } = event.queryStringParameters
	// @ts-ignore
	const redisClient = new Redis({
		url: process.env.UPSTASH_REDIS_REST_URL,
		token: process.env.UPSTASH_REDIS_REST_TOKEN
	})

	const requestName = `county-hotspots-${regioncode}`
	try {
		const cachedRes = await redisClient.get(requestName)
		if (cachedRes) {
			return {
				statusCode: 200,
				body: JSON.stringify(JSON.parse(cachedRes))
			}
		} else {
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
			// cache duration a little less than 1 day
			await redisClient.set(requestName, JSON.stringify(hotspots))
			return {
				statusCode: 200,
				body: JSON.stringify(hotspots)
			}
		}
	}
	catch (err) {
		return {
			statusCode: 500,
			body: 'Something went wrong while fetching the hotspots.'
		}
	}
}
