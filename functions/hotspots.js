const { URL } = require( 'url' )
const fetch = require( 'node-fetch' )

exports.handler = async ( event ) => {

	const { regioncode, back } = event.queryStringParameters
	if ( !regioncode ) return {
		statusCode: 400,
		body: 'this request requires an ebird region code'
	}

	const requestName = `county-hotspots-${regioncode}`
	try {
		// @ts-ignore
		const cachedRes = await fetch(
			`${process.env.UPSTASH_REDIS_REST_URL}/get/${requestName}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
				}
			}
		)
		const jsonRes = await cachedRes.json()

		if ( jsonRes.result ) {
			const parsedRes = JSON.parse( jsonRes.result )
			return {
				statusCode: 200,
				body: JSON.stringify( parsedRes )
			}
		} else {
			const ebirdApi = new URL( `https://api.ebird.org/v2/ref/hotspot/${regioncode}` )
			ebirdApi.searchParams.set( 'fmt', 'json' )
			ebirdApi.searchParams.set( 'back', back )

			const hotspots = await fetch( ebirdApi, {
				method: 'GET',
				redirect: 'follow',
				headers: {
					'x-ebirdapitoken': process.env.EBIRD_TOKEN
				}
			} )
				.then( response => {
					if ( response.status === 200 ) return response.json()
					else return {
						responseType: 'error',
						statusCode: response.status,
						body: response.statusText
					}
				} )

				// reformat response to geoJson for Mapbox
				.then( data => {
					if ( data.responseType === 'error' ) return data
					const geoJson = data.map( spot => {
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
					} )
					return geoJson
				} )
				.catch( error => {
					return error
				} )

			const hotspotString = JSON.stringify( hotspots )

			await fetch(
				`${process.env.UPSTASH_REDIS_REST_URL}/set/${requestName}/?EX=85400`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
					},
					body: hotspotString
				}
			)
			return {
				statusCode: 200,
				body: hotspotString
			}
		}
	}
	catch ( err ) {
		return {
			statusCode: 500,
			body: 'Something went wrong while fetching the hotspots.'
		}
	}
}
