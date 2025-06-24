import {Prisma, Round, User} from "../../generated/prisma";

export interface IDataBase {
    createUser(user: Prisma.UserCreateInput): Promise<User>;

    findUser(username: string): Promise<User | null>;

    createRound(round: Prisma.RoundCreateInput): Promise<Round>;

    findAllRounds(): Promise<Round[]>;

    findRound(id: string): Promise<Round | null>;

    getRoundResults(roundId: string): Promise<Record<string, number>>

    writeRoundScores(roundId: string, scores: Record<string, number>): Promise<void>
}