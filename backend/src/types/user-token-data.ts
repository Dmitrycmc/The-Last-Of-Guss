import {Role} from "../generated/prisma";

export type UserTokenData = {
    username: string
    role: Role
}