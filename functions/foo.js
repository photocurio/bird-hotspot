const { Redis } = require('@upstash/redis')

exports.handler = async () => {
	const redis = Redis.fromEnv()
	await redis.set('foo', 'bar')
	const bar = await redis.get('foo')
	return {
		statusCode: 200,
		body: JSON.stringify(bar)
	}
}
