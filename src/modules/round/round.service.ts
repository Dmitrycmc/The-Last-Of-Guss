import {database} from "infra/database";
import {getRoundStatus} from "utils/round";
import {RoundStatus} from "generated/prisma";
import {NotFoundError} from "errors/app-error";
import {RoundInfo, Winner} from "modules/round/types";

class RoundService {
    async getAllRounds() {
        const rounds = await database.findAllRounds()

        const now = new Date()
        return rounds.map(round => ({
            ...round,
            status: getRoundStatus(round.startAt, round.endAt, now)
        }))
    }

    async getRoundInfo(roundId: string, userId?: string): Promise<RoundInfo> {
        const round = await database.findRound(roundId)

        if (!round) {
            throw new NotFoundError('Round not found')
        }

        const now = new Date()
        const status = getRoundStatus(round.startAt, round.endAt, now)

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
}

export default new RoundService()
