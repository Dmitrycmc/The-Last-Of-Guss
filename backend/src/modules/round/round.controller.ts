import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify'
import roundService from './round.service'
import {requireUser} from "../../middlewares/require-user.middleware";
import {requireAdminRole} from "../../middlewares/require-admin-role.middleware";

export async function roundRoutes(app: FastifyInstance) {
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

    app.post('/rounds/:id/tap', { preHandler: [requireUser] }, async (req: FastifyRequest, res: FastifyReply) => {
        const user = req.user!
        const {id} = req.params as { id: string }

        return await roundService.handleTap(id, user)
    })
}