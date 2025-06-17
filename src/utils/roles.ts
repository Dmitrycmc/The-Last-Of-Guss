import {ADMIN_ROLE, NIKITA_ROLE, Role, USER_ROLE} from "../modules/auth/types";

export const resolveRole = (username: string): Role => {
    if (username === 'admin') {
        return ADMIN_ROLE
    }
    if (username === 'Никита') {
        return NIKITA_ROLE
    }
    return USER_ROLE
}