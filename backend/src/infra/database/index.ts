import {IDataBase} from "./database.interface";
import {Prisma, PrismaClient, Round, User} from "../../generated/prisma";
import {BadRequestError} from "../../errors/app-error";

const prisma = new PrismaClient()

class PrismaDataBase implements IDataBase {
    constructor(private _prisma: PrismaClient) {}

    disconnect(): Promise<void> {
        return this._prisma.$disconnect()
    }

    async createUser(data: Prisma.UserCreateInput): Promise<User> {
        return this._prisma.user.create({data}).catch(e => {
            if (e.code === 'P2002') {
                throw new BadRequestError(`User ${data.username} already created`)
            }
            throw e
        })
    }

    createRound(data: Prisma.RoundCreateInput): Promise<Round> {
        return this._prisma.round.create({data})
    }

    findUser(username: string): Promise<User | null> {
        return this._prisma.user.findUnique({ where: { username } })
    }

    findAllRounds(): Promise<Round[]> {
        return this._prisma.round.findMany({
            orderBy: { createdAt: 'desc' }
        })
    }

    findRound(id: string): Promise<Round | null> {
        return this._prisma.round.findUnique({
            where: { id },
        })
    }

    async getRoundResults(roundId: string): Promise<Record<string, number>> {
        const results = await this._prisma.userRoundScore.findMany({
            where: { roundId },
            orderBy: { score: 'desc' },
            select: {
                username: true,
                score: true,
            },
        });

        return Object.fromEntries(results.map(r => [r.username, r.score]));
    }

    async writeRoundScores(roundId: string, scores: Record<string, number>): Promise<void> {
        const data = Object.entries(scores).map(([username, score]) => ({
            username,
            roundId,
            score,
        }));

        await this._prisma.userRoundScore.createMany({
            data,
            skipDuplicates: true,
        });
    }
}

const database: IDataBase = new PrismaDataBase(prisma)
export default database