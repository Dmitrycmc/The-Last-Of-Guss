import {AppError} from "errors/app-error";

export const errorHandlerPlugin = (app) => {
    app.setErrorHandler((error, req, reply) => {
        if (error instanceof AppError) {
            reply.status(error.statusCode).send({ error: error.message })
        } else {
            req.log.error(error)
            reply.status(500).send({ error: 'Internal Server Error' })
        }
    })
}