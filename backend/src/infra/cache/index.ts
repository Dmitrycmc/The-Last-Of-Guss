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

    async acquireLock(roundId: string, ttl = 10): Promise<boolean> {
        const key = `cooldown-lock:${roundId}`
        return await this._redis.set(key, '1', { NX: true, EX: ttl })
    }

    async releaseLock(roundId: string): Promise<boolean> {
        const key = `cooldown-lock:${roundId}`
        const result = await this._redis.del(key)
        return result === 1 // 1 = ключ был удалён, 0 = ключа не было
    }
}

const cache: ICache = new RedisCache(redis)
export default cache