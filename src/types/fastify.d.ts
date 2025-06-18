import 'fastify'
import {Role} from "generated/prisma";

declare module 'fastify' {
    interface FastifyRequest {
        user?: {
            id: string
            username: string
            role: Role
        }
    }
}