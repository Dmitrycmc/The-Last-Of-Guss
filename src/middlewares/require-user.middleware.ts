import {UnauthorizedError} from "errors/app-error";
import {FastifyReply, FastifyRequest} from "fastify";

export const requireUserMiddleware = async (req: FastifyRequest, res: FastifyReply) => {
    if (!req.user) {
        throw new UnauthorizedError()
    }
}