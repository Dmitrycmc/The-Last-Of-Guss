export interface Round {
    id: string
    status: RoundStatus
    startAt: string
    endAt: string
    createdAt: string
//    winnerId: string | null
}

export enum Role {
    ADMIN_ROLE = 'ADMIN_ROLE',
    USER_ROLE = 'USER_ROLE',
    NIKITA_ROLE = 'NIKITA_ROLE'
}

export enum RoundStatus {
    COOLDOWN_STATUS = 'COOLDOWN_STATUS',
    ACTIVE_STATUS = 'ACTIVE_STATUS',
    FINISHED_STATUS = 'FINISHED_STATUS'
}