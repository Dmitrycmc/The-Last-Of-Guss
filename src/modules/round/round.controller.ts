import {FastifyInstance} from 'fastify'
import roundService from './round.service'

export async function roundRoutes(app: FastifyInstance) {
    app.get('/rounds', async (req, res) => await roundService.getAllRounds())

    app.get('/round/:id', async (req, res) => {
        const { id } = req.params as { id: string }
        const user = 'req.user' // todo: JWT middleware

        return await roundService.getRoundInfo(id, user?.id)
    })
}