import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify'
import roundService from './round.service'
import {requireUser} from "../../middlewares/require-user.middleware";
import {requireAdminRole} from "../../middlewares/require-admin-role.middleware";
import {WebSocketServer} from "ws";
import pubSub from "../../infra/pubsub";
import {parseToken} from "../../utils/jwt";
import {UserTokenData} from "../../types/user-token-data";
import {RoundStatus} from "../../generated/prisma";
import cache from "../../infra/cache";
import {getRoundStatus} from "../../utils/round";

export async function roundController(app: FastifyInstance) {
    const wss = new WebSocketServer({ server: app.server })

    wss.on('connection', async (ws, request) => {
        // todo: move this to services
        const authHeader = request.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            ws.close(1008, 'Missing or invalid Authorization header')
            return
        }

        const token = authHeader.split(' ')[1]
        let user: UserTokenData

        try {
            user = parseToken(token)
        } catch (err) {
            ws.close(1008, 'Invalid token')
            return
        }

        const match = request.url?.match(/\/rounds\/([\w-]+)/)
        if (!match) {
            ws.close(1008, 'Invalid URL') // 1008 = Policy Violation
            return
        }

        const roundId = match[1]
        const round = await roundService.getRoundInfo(roundId)
        if (!round) {
            ws.close(1008, 'Round not found')
            return
        }
        if (round.status === RoundStatus.FINISHED_STATUS) {
            ws.close(1008, 'Round is finished')
            return
        }

        if (round.status === RoundStatus.COOLDOWN_STATUS) {
            const timeToStart = (round.startAt - new Date()) / 1000
            const isLeader = await cache.acquireLock(roundId, Math.floor(timeToStart) + 2)
            if (isLeader) {
                console.log('Leader')
                let remaining = Math.floor(timeToStart)
                // todo: extract timer helpers
                setTimeout(() => {
                    let intervalId = setInterval(() => {
                        if (remaining <= 0) {
                            clearInterval(intervalId)
                            pubSub.publish(roundId, {type: 'start'})

                            remaining = (round.endAt - round.startAt) / 1000
                            intervalId = setInterval(() => {
                                if (remaining <= 0) {
                                    clearInterval(intervalId)
                                    pubSub.publish(roundId, {type: 'end'})
                                } else {
                                    pubSub.publish(roundId, {type: 'game-tick', remaining})
                                    remaining--
                                }
                            }, 1000)
                        } else {
                            pubSub.publish(roundId, {type: 'cooldown-tick', remaining})
                            remaining--
                        }
                    }, 1000)
                }, timeToStart - remaining)
            }
        }

        const handler = (message: unknown) => {
            if (ws.readyState === ws.OPEN) {
                try {
                    ws.send(JSON.stringify(message))
                } catch (e) {
                    console.error('❌ WebSocket error:', e)
                    ws.terminate()
                }
            }
        }
        pubSub.subscribe(roundId, handler)
        ws.on('close', () => {
            pubSub.unsubscribe(roundId, handler)
        })
        ws.on('message', (str) => {
            try {
                if (str.toString() === 'tap' && getRoundStatus(round.startAt, round.endAt) === RoundStatus.ACTIVE_STATUS) {
                    roundService.handleTap(roundId, user)
                }
            } catch (e) {
                console.error('❌ WebSocket error:', e)
            }
        })
    })

    app.post('/rounds', { preHandler: [requireUser, requireAdminRole] }, async (req, res) => {
        const { startAt, duration } = req.body as { startAt: string, duration: number }

        return await roundService.createRound(startAt, duration)
    })

    app.get('/rounds', { preHandler: requireUser }, async (req, res) => await roundService.getAllRounds())

    app.get('/rounds/:id', { preHandler: requireUser }, async (req: FastifyRequest, res: FastifyReply) => {
        const { id } = req.params as { id: string }
        const user = req.user!

        return await roundService.getRoundInfo(id, user.id)
    })
}