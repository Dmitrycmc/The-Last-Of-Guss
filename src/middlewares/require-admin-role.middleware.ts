import {UnauthorizedError} from "errors/app-error";
import {FastifyRequest} from "fastify";
import {Role} from "generated/prisma";

export const requireAdminRoleMiddleware = async (req: FastifyRequest, res) => {
    if (req.user?.role !== Role.ADMIN_ROLE) {
        throw new UnauthorizedError()
    }
}