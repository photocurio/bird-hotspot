const { Redis } = require('@upstash/redis')

exports.handler = async () => {
	try {
		const redis = Redis.fromEnv()
		await redis.set('foo', 'bar')
		const bar = await redis.get('foo')
		return {
			statusCode: 200,
			body: JSON.stringify(bar)
		}
	}
	catch (error) {
		console.log(error)
		return {
			statusCode: error.statusCode,
			body: 'this sucked'
		}
	}
}
