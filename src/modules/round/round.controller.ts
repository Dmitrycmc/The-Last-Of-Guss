import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify'
import roundService from './round.service'
import {requireUserMiddleware} from "middlewares/require-user.middleware";

export async function roundRoutes(app: FastifyInstance) {
    app.get('/rounds', { preHandler: requireUserMiddleware }, async (req, res) => await roundService.getAllRounds())

    app.get('/round/:id', { preHandler: requireUserMiddleware }, async (req: FastifyRequest, res: FastifyReply) => {
        const { id } = req.params as { id: string }
        const user = req.user!

        return await roundService.getRoundInfo(id, user.id)
    })
}