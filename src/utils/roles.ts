import {Role} from "generated/prisma";

export const resolveRole = (username: string): Role => {
    if (username === 'admin') {
        return Role.ADMIN_ROLE
    }
    if (username === 'Никита') {
        return Role.NIKITA_ROLE
    }
    return Role.USER_ROLE
}