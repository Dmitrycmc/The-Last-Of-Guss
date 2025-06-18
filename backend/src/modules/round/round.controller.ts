import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify'
import roundService from './round.service'
import {requireUserMiddleware} from "../../middlewares/require-user.middleware";
import {requireAdminRoleMiddleware} from "../../middlewares/require-admin-role.middleware";

export async function roundRoutes(app: FastifyInstance) {
    app.post('/rounds', { preHandler: [requireUserMiddleware, requireAdminRoleMiddleware] }, async (req, res) => {
        const { startAt, duration } = req.body as { startAt: string, duration: number }

        const result = await roundService.createRound(startAt, duration)
        return res.send(result)
    })

    app.get('/rounds', { preHandler: requireUserMiddleware }, async (req, res) => await roundService.getAllRounds())

    app.get('/rounds/:id', { preHandler: requireUserMiddleware }, async (req: FastifyRequest, res: FastifyReply) => {
        const { id } = req.params as { id: string }
        const user = req.user!

        return await roundService.getRoundInfo(id, user.id)
    })
}