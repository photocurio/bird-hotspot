const { Redis } = require('@upstash/redis')

exports.handler = async () => {
	const redis = new Redis({
		url: process.env.UPSTASH_REDIS_REST_URL,
		token: process.env.UPSTASH_REDIS_REST_TOKEN
	})

	await redis.set('foo', 'bar')
	const bar = await redis.get('foo')
	return {
		statusCode: 200,
		body: JSON.stringify(bar)
	}
}
