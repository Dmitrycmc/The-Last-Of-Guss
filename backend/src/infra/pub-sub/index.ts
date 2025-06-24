import {createClient} from 'redis'
import {IPubSub} from "./pub-sub.interface";
import config from "../../config";
import * as os from "os";

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

    async publish(roundId: string, message: any): Promise<void> {
        await this._pub.publish(roundId, JSON.stringify({
            ...message,
            // containerId if docker, ip if locally, host if cloud
            leader: os.hostname()
        }))
    }

    subscribe(roundId: string, cb: (message: any) => void): void {
        this._sub.subscribe(roundId, (str: string) => {
            const message = JSON.parse(str)
            cb({
                ...message,
                // containerId if docker, ip if locally, host if cloud
                connected: os.hostname()
            })
        })
    }

    unsubscribe(roundId: string, cb: (message: unknown) => void): void {
        //todo: implement
    }
}

const pubSub: IPubSub = new RedisPubSub(redisPub, redisSub)
export default pubSub