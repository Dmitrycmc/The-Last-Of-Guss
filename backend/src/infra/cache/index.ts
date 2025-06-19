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

    async acquireLock(roundId: string): Promise<boolean> {
        const key = `cooldown-lock:${roundId}`
        return Boolean(await this._redis.set(key, '1', { NX: true, EX: 1 }))
    }

    async prolongateLock(roundId: string): Promise<void> {
        const key = `cooldown-lock:${roundId}`
        await this._redis.set(key, '1', { EX: 1 })
    }
}

const cache: ICache = new RedisCache(redis)
export default cache