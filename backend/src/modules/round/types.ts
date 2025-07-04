import {RoundStatus} from "../../generated/prisma";

export type Winner = { username: string; score: number }

export type RoundInfo = {
    id: string,
    startAt: Date,
    endAt: Date,
    status: RoundStatus,
    scores: Record<string, number>,
}
