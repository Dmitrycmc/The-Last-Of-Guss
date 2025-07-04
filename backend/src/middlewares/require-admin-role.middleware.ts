import {ForbiddenError} from "../errors/app-error";
import {Middleware} from "fastify";
import {Role} from "../generated/prisma";

export const requireAdminRole: Middleware = async (req, res) => {
    if (req.user?.role !== Role.ADMIN_ROLE) {
        throw new ForbiddenError('Required ADMIN role')
    }
}