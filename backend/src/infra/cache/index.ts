import {createClient} from 'redis'
import config from "../../config";
import {ICache} from "./cache.interface";

const redis = createClient({
    url: config.redisUrl,
})

redis.on('error', (err) => console.error('❌ Redis error:', err))
redis.connect() // todo: move to main

class RedisCache implements ICache {
    constructor(private _redis: ReturnType<typeof createClient>) {}

    async incrementScore(roundId: string, userId: string): Promise<number> {
        const key = `score:${roundId}:${userId}`
        return await this._redis.incr(key)
    }
}

const cache: ICache = new RedisCache(redis)
export default cache