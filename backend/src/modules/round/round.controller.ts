import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify'
import roundService from './round.service'
import {requireUser} from "../../middlewares/require-user.middleware";
import {requireAdminRole} from "../../middlewares/require-admin-role.middleware";
import {WebSocketServer} from "ws";
import {parseToken} from "../../utils/jwt";
import {UserTokenData} from "../../types/user-token-data";
import database from "../../infra/database";
import {parse} from "url";
import config from "../../config";
import {webSocketService} from "./web-socket.service";

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

        webSocketService({ws, round, user})
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