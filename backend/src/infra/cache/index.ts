import {createClient} from 'redis'
import config from "../../config";
import {ICache} from "./cache.interface";
import {tapsToScores} from "../../utils/scores";

const redis = createClient({
    url: config.redisUrl,
})

redis.on('error', (err) => console.error('❌ Redis error:', err))
redis.connect().then(() => {
    console.log("Redis successfully connected")
}) // todo: move to main

class RedisCache implements ICache {
    constructor(private _redis: ReturnType<typeof createClient>) {}

    async getRoundScores(roundId: string): Promise<Record<string, number>> {
        const pattern = `taps:${roundId}:*`;
        const keys = await this._redis.keys(pattern);

        if (keys.length === 0) return {};

        const values = await this._redis.mGet(keys);

        const result: Record<string, number> = {};

        for (let i = 0; i < keys.length; i++) {
            const username = keys[i].split(':')[2]; // taps:<roundId>:<username>
            result[username] = tapsToScores(Number(values[i]));
        }

        return result;
    }

    async incrementScore(roundId: string, username: string): Promise<number> {
        const key = `taps:${roundId}:${username}`
        const taps = await this._redis.incr(key)
        return tapsToScores(taps)
    }

    async acquireLock(roundId: string): Promise<boolean> {
        const key = `cooldown-lock:${roundId}`
        return Boolean(await this._redis.set(key, '1', { NX: true, EX: 2 }))
    }

    async prolongateLock(roundId: string): Promise<void> {
        const key = `cooldown-lock:${roundId}`
        await this._redis.set(key, '1', { EX: 2 })
    }
}

const cache: ICache = new RedisCache(redis)
export default cache