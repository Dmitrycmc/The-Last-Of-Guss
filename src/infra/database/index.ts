import {IDataBase} from "./database.interface";
import {Prisma, PrismaClient, Round, User, UserRoundScore} from "generated/prisma";
import {BadRequestError} from "errors/app-error";

const prisma = new PrismaClient()

class PrismaDataBase implements IDataBase {
    constructor(private _prisma: PrismaClient) {}

    disconnect(): Promise<void> {
        return this._prisma.$disconnect()
    }

    createUser(data: Prisma.UserCreateInput): Promise<User> {
        return this._prisma.user.create({data}).catch(e => {
            if (e.code === 'P2002') {
                throw new BadRequestError(`User ${data.username} already created`)
            }
        })
    }

    findUser(username: string): Promise<User | null> {
        return this._prisma.user.findUnique({ where: { username } })
    }

    findAllRounds(): Promise<Round[]> {
        return this._prisma.round.findMany({
            orderBy: { startAt: 'desc' }
        })
    }

    findRound(id: string): Promise<Round | null> {
        return this._prisma.round.findUnique({
            where: { id },
        })
    }

    findUserRoundScore(userId: string, roundId: string): Promise<UserRoundScore | null> {
        return this._prisma.userRoundScore.findUnique({
            where: { userId_roundId: { userId, roundId } }
        })
    }

    findUserRoundScoreMax(roundId: string): Promise<UserRoundScore | null> {
        return this._prisma.userRoundScore.findFirst({
            where: { roundId },
            orderBy: { score: 'desc' },
        })
    }
}

export const database: IDataBase = new PrismaDataBase(prisma)