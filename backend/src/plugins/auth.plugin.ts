import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {parseToken} from "../utils/jwt";

export const authPlugin = (app: FastifyInstance) => {
    app.addHook('preHandler', async (req: FastifyRequest, res: FastifyReply) => {
        const auth = req.headers.authorization
        if (!auth || !auth.startsWith('Bearer ')) {
            return
        }

        const token = auth.split(' ')[1]
        try {
            req.user = parseToken(token)
        } catch (err) {
            req.log.warn('Invalid JWT')
        }
    })
}