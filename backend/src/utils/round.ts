import {RoundStatus} from "../generated/prisma";

export const getRoundStatus = (startAt: Date, endAt: Date): RoundStatus => {
    const now = new Date()
    if (now < startAt) return RoundStatus.COOLDOWN_STATUS
    if (now >= endAt) return RoundStatus.FINISHED_STATUS
    return RoundStatus.ACTIVE_STATUS
}