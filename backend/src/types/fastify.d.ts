import 'fastify'
import {FastifyReply} from "fastify";
import {UserTokenData} from "./user-token-data";

declare module 'fastify' {
    interface FastifyRequest {
        user?: UserTokenData
    }

    interface Middleware {
        (req: FastifyRequest, reply: FastifyReply): void
    }
}