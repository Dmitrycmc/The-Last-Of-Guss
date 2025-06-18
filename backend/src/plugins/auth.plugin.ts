import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {parseToken} from "../utils/jwt";

export const authPlugin = (app: FastifyInstance) => {
    app.addHook('preHandler', (req: FastifyRequest, res: FastifyReply, done) => {
        const auth = req.headers.authorization
        if (auth && auth.startsWith('Bearer ')) {
            const token = auth.split(' ')[1]

            try {
                req.user = parseToken(token)
            } catch (err) {
                req.log.warn('Invalid JWT')
            }
        }
        done()
    })
}