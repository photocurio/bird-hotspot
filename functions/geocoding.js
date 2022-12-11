const fetch = require( 'node-fetch' )
const { URL } = require( 'url' )

exports.handler = async ( event ) => {
	const { q } = event.queryStringParameters

	if ( q.includes( '<' ) ) {
		return {
			responseType: 'error',
			statusCode: 514,
			body: 'html not permitted'
		}
	}
	else if ( q.length > 60 ) {
		return {
			responseType: 'error',
			statusCode: 514,
			body: 'search text too long'
		}
	}

	const mapboxApiKey = process.env.MAPBOX_TOKEN

	const geocodeApi = new URL( `https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json` )

	geocodeApi.searchParams.set( 'country', 'US' )
	geocodeApi.searchParams.set( 'types', 'region,district,place' )
	geocodeApi.searchParams.set( 'limit', '1' )
	geocodeApi.searchParams.set( 'language', 'en' )
	geocodeApi.searchParams.set( 'access_token', mapboxApiKey )

	const res = await fetch( geocodeApi, { method: 'GET', redirect: 'follow' } )
	if ( res.status === 200 ) {
		const resJson = await res.json()
		return {
			statusCode: 200,
			body: JSON.stringify( resJson )
		}
	} else return {
		responseType: 'error',
		statusCode: res.status,
		body: res.statusText
	}
}
