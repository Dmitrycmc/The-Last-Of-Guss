import {Role} from "../generated/prisma";

export type UserTokenData = {
    id: string
    username: string
    role: Role
}