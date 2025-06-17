export const USER_ROLE = 'USER_ROLE'
export const ADMIN_ROLE = 'ADMIN_ROLE'
export const NIKITA_ROLE = 'NIKITA_ROLE'

export type Role = typeof USER_ROLE | typeof ADMIN_ROLE | typeof  NIKITA_ROLE

export type WithId<T extends Record<string, string>> = T & {
    id: string
}

export type User = {
    username: string
    password: string
    role: Role
}