import database from "../../infra/database";
import {getRoundStatus} from "../../utils/round";
import {RoundStatus} from "../../generated/prisma";
import {NotFoundError} from "../../errors/app-error";
import {RoundInfo} from "./types";
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

        const scores = await database.getRoundResults(roundId);

        return {
            id: round.id,
            startAt: round.startAt,
            endAt: round.endAt,
            status,
            scores
        }
    }

    async handleTap(roundId: string, user: UserTokenData): Promise<void> {
        const round = await database.findRound(roundId) // cache
        if (user.role === "NIKITA_ROLE") {
            cache.setScore(roundId, user.username, 0)
            await pubSub.publish(roundId, {type: 'update-score', scores: {[user.username]: 0}})
            return
        }
        if (!round) throw new NotFoundError('Round not found')

        const isActive = getRoundStatus(round.startAt, round.endAt) === RoundStatus.ACTIVE_STATUS
        if (!isActive) {
            return
        }

        const score = await cache.incrementScore(roundId, user.username)
        await pubSub.publish(roundId, {type: 'update-score', scores: {[user.username]: score}})
    }
}

export default new RoundService()
