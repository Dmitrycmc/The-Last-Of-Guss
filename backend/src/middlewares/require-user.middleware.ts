import {UnauthorizedError} from "../errors/app-error";
import {Middleware} from "fastify";

export const requireUser: Middleware = async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError()
    }
}