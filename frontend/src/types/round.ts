export interface RoundInfo {
    id: string
    status: RoundStatus
    startAt: string
    endAt: string
    scores: Record<string, number>,
}

export interface Round {
    id: string
    status: RoundStatus
    startAt: string
    endAt: string
    createdAt: string
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