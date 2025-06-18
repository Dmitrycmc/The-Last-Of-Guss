import {createClient} from 'redis'
import {IPubSub} from "./pub-sub.interface";
import config from "../../config";

const redisPub = createClient({
    url: config.redisUrl,
})
const redisSub = redisPub.duplicate()

redisPub.on('error', (err) => console.error('❌ Redis pub error:', err))
redisPub.connect()// todo: move to main

redisSub.on('error', (err) => console.error('❌ Redis sub error:', err))
redisSub.connect()// todo: move to main

class RedisPubSub implements IPubSub {
    constructor(private _pub: ReturnType<typeof createClient>, private _sub: ReturnType<typeof createClient>) {}

    async publish(roundId: string, userId: string, score: number): Promise<void> {
        await this._pub.publish('score-updated', JSON.stringify({
            userId,
            roundId,
            score
        }))
    }

    subscribe(cb: (roundId: string, userId: string, score: number) => void): void {
        this._sub.subscribe('score-updated', (str: string) => {
            const {roundId, userId, score} = JSON.parse(str)
            cb(roundId, userId, score)
        })
    }
}

const pubSub: IPubSub = new RedisPubSub(redisPub, redisSub)
export default pubSub