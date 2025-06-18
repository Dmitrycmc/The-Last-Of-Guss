import {UnauthorizedError} from "../errors/app-error";
import {Middleware} from "fastify";

export const requireUserMiddleware: Middleware = (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError()
    }
}