import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify'
import roundService from './round.service'
import {requireUser} from "../../middlewares/require-user.middleware";
import {requireAdminRole} from "../../middlewares/require-admin-role.middleware";
import {WebSocketServer} from "ws";
import {parseToken} from "../../utils/jwt";
import {UserTokenData} from "../../types/user-token-data";
import {RoundStatus} from "../../generated/prisma";
import cache from "../../infra/cache";
import {getRoundStatus} from "../../utils/round";
import pubSub from "../../infra/pub-sub";
import {randomUUID} from "crypto";
import database from "../../infra/database";
import {parse} from "url";
import config from "../../config";

export async function roundController(app: FastifyInstance) {
    const wss = new WebSocketServer({ server: app.server })

    wss.on('connection', async (ws, request) => {
        const { query } = parse(request.url || '', true)
        const {token} = query as {token: unknown}

        if (typeof token !== 'string' || !token) {
            ws.close(1008, 'Missing token')
            return
        }

        let user: UserTokenData

        try {
            user = parseToken(token)
        } catch (err) {
            ws.close(1008, 'Invalid token')
            return
        }

        const match = request.url?.match(/\/rounds\/([\w-]+)/)
        if (!match) {
            ws.close(1008, 'Invalid URL')
            return
        }

        const roundId = match[1]
        const round = await database.findRound(roundId)
        if (!round) {
            ws.close(1008, 'Round not found')
            return
        }

        const scores = await cache.getRoundScores(roundId)
        ws.send(JSON.stringify({type: 'update-score', scores}))

        if (getRoundStatus(round.startAt, round.endAt) === RoundStatus.FINISHED_STATUS) {
            ws.close(1008, 'Round is finished')
            return
        }

        const wsId = randomUUID()
        pubSub.publish(roundId, {type: 'kick', username: user.username, wsId})

        const takeLeadership = () => {
            console.log('Took leadership')
            if (getRoundStatus(round.startAt, round.endAt) === RoundStatus.COOLDOWN_STATUS) {
                const timeToStart = (round.startAt.getTime() - Date.now()) / 1000
                let remaining = Math.floor(timeToStart)
                setTimeout(() => {
                    const intervalId = setInterval(() => {
                        cache.prolongateLock(roundId)
                        if (remaining <= 0) {
                            clearInterval(intervalId)
                            pubSub.publish(roundId, {type: 'start'})
                            takeLeadership()
                        } else {
                            pubSub.publish(roundId, {type: 'cooldown-tick', remaining})
                            remaining--
                        }
                    }, 1000)
                }, timeToStart - remaining)
            }

            if (getRoundStatus(round.startAt, round.endAt) === RoundStatus.ACTIVE_STATUS) {
                const timeToEnd = (round.endAt.getTime() - Date.now()) / 1000
                let remaining = Math.floor(timeToEnd)
                setTimeout(() => {
                    const intervalId = setInterval(() => {
                        if (remaining <= 0) {
                            clearInterval(intervalId)
                            cache.getRoundScores(roundId).then(scores => {
                                pubSub.publish(roundId, {type: 'end', scores })
                                database.writeRoundScores(roundId, scores)
                            })
                        } else {
                            cache.prolongateLock(roundId)
                            pubSub.publish(roundId, {type: 'game-tick', remaining})
                            remaining--
                        }
                    }, 1000)
                }, timeToEnd - remaining)
            }
        }

        let intervalId: NodeJS.Timeout
        if (await cache.acquireLock(roundId)) {
            takeLeadership()
        } else {
            intervalId = setInterval(async () => {
                if (await cache.acquireLock(roundId)) {
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
        pubSub.subscribe(roundId, handler)
        ws.on('close', () => {
            pubSub.unsubscribe(roundId, handler)
            clearInterval(intervalId)
        })
        ws.on('message', (str) => {
            try {
                if (str.toString() === 'tap') {
                    roundService.handleTap(roundId, user)
                }
            } catch (e) {
                console.error('❌ WebSocket error:', e)
            }
        })
    })

    app.post('/rounds', { preHandler: [requireUser, requireAdminRole] }, async (req, res) => {
        return await roundService.createRound(config.cooldownDuration, config.roundDuration)
    })

    app.get('/rounds', { preHandler: requireUser }, async (req, res) => await roundService.getAllRounds())

    app.get('/rounds/:id', { preHandler: requireUser }, async (req: FastifyRequest, res: FastifyReply) => {
        const { id } = req.params as { id: string }
        const user = req.user!

        return await roundService.getRoundInfo(id, user.username)
    })
}