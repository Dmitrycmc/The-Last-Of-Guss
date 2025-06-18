import database from "../../infra/database";
import {getRoundStatus} from "../../utils/round";
import {RoundStatus} from "../../generated/prisma";
import {BadRequestError, NotFoundError} from "../../errors/app-error";
import {RoundInfo, Winner} from "./types";
import {UserTokenData} from "../../types/user-token-data";
import cache from "../../infra/cache";
import pubSub from "../../infra/pubsub";

class RoundService {
    async createRound(startAt: string, duration = 30) {
        const start = startAt ? new Date(startAt) : new Date()
        const end = new Date(start.getTime() + duration * 1000)

        return await database.createRound({
                startAt: start,
                endAt: end,
        })
    }

    async getAllRounds() {
        const rounds = await database.findAllRounds()

        return rounds.map(round => ({
            ...round,
            status: getRoundStatus(round.startAt, round.endAt)
        }))
    }

    async getRoundInfo(roundId: string, userId?: string): Promise<RoundInfo> {
        const round = await database.findRound(roundId)

        if (!round) {
            throw new NotFoundError('Round not found')
        }

        const status = getRoundStatus(round.startAt, round.endAt)

        let score = 0
        if (userId) {
            const record = await database.findUserRoundScore(userId, roundId)
            if (record) {
                score = record.score
            }
        }

        let winner: Winner | null = null
        if (status === RoundStatus.FINISHED_STATUS) {
            const top = await database.findUserRoundScoreMax(roundId)
            if (top) {
                winner = { userId: top.userId, score: top.score }
            }
        }

        return {
            id: round.id,
            startAt: round.startAt,
            endAt: round.endAt,
            status,
            score,
            winner
        }
    }

    async handleTap(roundId: string, user: UserTokenData): Promise<{ score: number }> {
        const round = await database.findRound(roundId)
        if (!round) throw new NotFoundError("Round not found")

        const isActive = getRoundStatus(round.startAt, round.endAt) === RoundStatus.ACTIVE_STATUS
        if (!isActive) throw new BadRequestError('Round is not active')

        const score = await cache.incrementScore(roundId, user.id)
        pubSub.publish(roundId, user.id, score)

        return { score }
    }
}

export default new RoundService()
