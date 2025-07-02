import cache from "../../infra/cache";
import {getRoundStatus} from "../../utils/round";
import {randomUUID} from "crypto";
import pubSub from "../../infra/pub-sub";
import database from "../../infra/database";
import roundService from "./round.service";
import {Round, RoundStatus} from "../../generated/prisma";
import WebSocket from "ws";
import {UserTokenData} from "../../types/user-token-data";


export const webSocketService = async ({ws, round, user}: {ws: WebSocket, round: Round, user: UserTokenData}) => {
    const scores = await cache.getRoundScores(round.id)
    ws.send(JSON.stringify({type: 'update-score', scores}))

    if (getRoundStatus(round.startAt, round.endAt) === RoundStatus.FINISHED_STATUS) {
        ws.close(1008, 'Round is finished')
        return
    }

    const wsId = randomUUID()
    pubSub.publish(round.id, {type: 'kick', username: user.username, wsId})

    const takeLeadership = () => {
        console.log('Took leadership')
        if (getRoundStatus(round.startAt, round.endAt) === RoundStatus.COOLDOWN_STATUS) {
            const timeToStartSec = (round.startAt.getTime() - Date.now()) / 1000
            let remainingSec = Math.floor(timeToStartSec)
            setTimeout(() => {
                if (remainingSec <= 0) {
                    pubSub.publish(round.id, {type: 'start'})
                    takeLeadership()
                } else {
                    pubSub.publish(round.id, {type: 'cooldown-tick', remaining: remainingSec})
                    const intervalId = setInterval(() => {
                        cache.prolongateLock(round.id)
                        if (--remainingSec <= 0) {
                            clearInterval(intervalId)
                            pubSub.publish(round.id, {type: 'start'})
                            takeLeadership()
                        } else {
                            pubSub.publish(round.id, {type: 'cooldown-tick', remaining: remainingSec})
                        }
                    }, 1000)
                }
            }, (timeToStartSec - remainingSec) * 1000)
        }

        if (getRoundStatus(round.startAt, round.endAt) === RoundStatus.ACTIVE_STATUS) {
            const timeToEnd = (round.endAt.getTime() - Date.now()) / 1000
            let remaining = Math.floor(timeToEnd)
            setTimeout(() => {
                const intervalId = setInterval(() => {
                    if (remaining <= 0) {
                        clearInterval(intervalId)
                        cache.getRoundScores(round.id).then(scores => {
                            pubSub.publish(round.id, {type: 'end', scores })
                            database.writeRoundScores(round.id, scores)
                        })
                    } else {
                        cache.prolongateLock(round.id)
                        pubSub.publish(round.id, {type: 'game-tick', remaining})
                        remaining--
                    }
                }, 1000)
            }, timeToEnd - remaining)
        }
    }

    let intervalId: NodeJS.Timeout
    if (await cache.acquireLock(round.id)) {
        takeLeadership()
    } else {
        intervalId = setInterval(async () => {
            if (await cache.acquireLock(round.id)) {
                clearInterval(intervalId)
                takeLeadership()
            }
        }, 1000)
    }

    const handler = (message: any) => {
        if (ws.readyState === ws.OPEN) {
            if (message.type === 'kick' && message.username === user.username && message.wsId !== wsId) {
                ws.close(4001, 'Another session started')
                clearInterval(intervalId)
                return
            }
            try {
                ws.send(JSON.stringify(message))
            } catch (e) {
                console.error('❌ WebSocket error:', e)
                clearInterval(intervalId)
                ws.terminate()
            }
        }
    }
    pubSub.subscribe(round.id, handler)
    ws.on('close', () => {
        pubSub.unsubscribe(round.id, handler)
        clearInterval(intervalId)
    })
    ws.on('message', (str) => {
        try {
            if (str.toString() === 'tap') {
                roundService.handleTap(round.id, user)
            }
        } catch (e) {
            console.error('❌ WebSocket error:', e)
        }
    })
}