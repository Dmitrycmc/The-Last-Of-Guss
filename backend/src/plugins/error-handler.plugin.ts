import {AppError} from "../errors/app-error";
import {FastifyError, FastifyInstance, FastifyReply, FastifyRequest} from "fastify";

export const errorHandlerPlugin = (app: FastifyInstance) => {
    app.setErrorHandler((error: FastifyError, req: FastifyRequest, reply: FastifyReply) => {
        if (error instanceof AppError) {
            reply.status(error.statusCode).send({ error: error.message })
        } else {
            req.log.error(error)
            reply.status(500).send({ error: 'Internal Server Error' })
        }
    })
}