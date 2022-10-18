const fetch = require( 'node-fetch' )

exports.handler = async ( event ) => {
	const { q } = event.queryStringParameters
	const username = process.env.GEONAMES_USERNAME
	const geocodeUrl = `http://api.geonames.org/geoCodeAddressJSON?q=${q}&username=${username}`

	// @ts-ignore
	const res = await fetch( geocodeUrl )
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
