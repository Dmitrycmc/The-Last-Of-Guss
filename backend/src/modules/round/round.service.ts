import database from "../../infra/database";
import {getRoundStatus} from "../../utils/round";
import {RoundStatus} from "../../generated/prisma";
import {BadRequestError, NotFoundError} from "../../errors/app-error";
import {RoundInfo, Winner} from "./types";
import {UserTokenData} from "../../types/user-token-data";
import cache from "../../infra/cache";
import pubSub from "../../infra/pub-sub";

class RoundService {
    async createRound(cooldownDuration: number, roundDuration: number) {
        const start = new Date(Date.now() + cooldownDuration * 1000)
        const end = new Date(Date.now() + cooldownDuration * 1000 + roundDuration * 1000)

        const newRound = await database.createRound({
                startAt: start,
                endAt: end,
        })

        return {...newRound, status: getRoundStatus(newRound.startAt, newRound.endAt)}
    }

    async getAllRounds() {
        const rounds = await database.findAllRounds()

        return rounds.map(round => ({
            ...round,
            status: getRoundStatus(round.startAt, round.endAt)
        }))
    }

    async getRoundInfo(roundId: string, username?: string): Promise<RoundInfo> {
        const round = await database.findRound(roundId)

        if (!round) {
            throw new NotFoundError('Round not found')
        }

        const status = getRoundStatus(round.startAt, round.endAt)

        let score = 0
        if (username) {
            const record = await database.findUserRoundScore(username, roundId)
            if (record) {
                score = record.score
            }
        }

        let winner: Winner | null = null
        if (status === RoundStatus.FINISHED_STATUS) {
            const top = await database.findUserRoundScoreMax(roundId)
            if (top) {
                winner = { username: top.username, score: top.score }
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

    async handleTap(roundId: string, user: UserTokenData): Promise<void> {
        const round = await database.findRound(roundId) // cache
        if (user.role === "NIKITA_ROLE") {
            return
        }
        if (!round) throw new NotFoundError('Round not found')

        const isActive = getRoundStatus(round.startAt, round.endAt) === RoundStatus.ACTIVE_STATUS
        if (!isActive) throw new BadRequestError('Round is not active')

        const score = await cache.incrementScore(roundId, user.username)
        await pubSub.publish(roundId, {type: 'update-score', scores: {[user.username]: score}})
    }
}

export default new RoundService()
