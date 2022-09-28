const { URL } = require('url')
const fetch = require('node-fetch')
const Redis = require('ioredis')

// client.set('foo', 'bar');
exports.handler = async (event) => {
	const { regioncode, back } = event.queryStringParameters
	// @ts-ignore
	const redisClient = new Redis("rediss://:bf0ef24c62d848ddbbe14c5cc3ee68b7@us1-big-albacore-38516.upstash.io:38516")

	const requestName = `county-hotspots-${regioncode}`
	try {
		const cachedRes = await redisClient.get(requestName)
		if (cachedRes) {
			console.log('got it from cache')
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
			console.log('got it from ebird, setting cache now	')
			// cache suration 1 day (86400 seconds)
			redisClient.set(requestName, JSON.stringify(hotspots), 'EX', 86400)
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
