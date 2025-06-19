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
        console.log(`Publish message to "${roundId}" topic: ${userId} - ${score}`)
        await this._pub.publish(roundId, JSON.stringify({
            userId,
            score
        }))
    }

    subscribe(roundId: string, cb: (userId: string, score: number) => void): void {
        this._sub.subscribe(roundId, (str: string) => {
            const {userId, score} = JSON.parse(str)
            console.log(`Receiver message from "${roundId}" topic: ${userId} - ${score}`)
            cb(userId, score)
        })
    }

    unsubscribe(roundId: string, cb: (userId: string, score: number) => void): void {
        //todo: implement
    }
}

const pubSub: IPubSub = new RedisPubSub(redisPub, redisSub)
export default pubSub