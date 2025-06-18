import {RoundStatus} from "generated/prisma";

export type Winner = { userId: string; score: number }

export type RoundInfo = {
    id: string,
    startAt: string,
    endAt: string,
    status: RoundStatus,
    score: number,
    winner: Winner | null
}
