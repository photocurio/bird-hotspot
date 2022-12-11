const fetch = require( 'node-fetch' )
exports.handler = async ( event ) => {
	const { locationCode, back } = event.queryStringParameters
	const requestName = `observations-${locationCode}`
	const cachedRes = await fetch( `${process.env.UPSTASH_REDIS_REST_URL}/get/${requestName}`,
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
			}
		}
	)
		.then( res => res.json() )
	// return the cached result if its truthy.	
	if ( cachedRes.result ) {
		const parsedRes = JSON.parse( cachedRes.result )
		return {
			statusCode: 200,
			body: JSON.stringify( parsedRes )
		}
		// If there is no cached data, fetch it from ebird.
	} else {
		const obs = await fetch(
			`https://api.ebird.org/v2/data/obs/${locationCode}/recent?fmt=json&back=${back}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'X-eBirdApiToken': process.env.EBIRD_TOKEN
				}
			}
		)
			.then( response => {
				return response.status === 200 ?
					response.json() :
					`error code: ${response.status}`
			} )
			.catch( error => {
				return error
			} )
		// Make an observations string to cache.
		const obsString = JSON.stringify( obs )
		await fetch(
			`${process.env.UPSTASH_REDIS_REST_URL}/set/${requestName}/?EX=85400`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
				},
				body: obsString
			}
		)
		return {
			statusCode: 200,
			body: obsString
		}
	}
}
