import {RoundStatus} from "../generated/prisma";

const now = new Date()

export const getRoundStatus = (startAt: Date, endAt: Date): RoundStatus => {
    if (now < startAt) return RoundStatus.COOLDOWN_STATUS
    if (now >= endAt) return RoundStatus.FINISHED_STATUS
    return RoundStatus.ACTIVE_STATUS
}