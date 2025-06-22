import {Prisma, Round, User, UserRoundScore} from "../../generated/prisma";

export interface IDataBase {
    createUser(user: Prisma.UserCreateInput): Promise<User>;

    findUser(username: string): Promise<User | null>;

    createRound(round: Prisma.RoundCreateInput): Promise<Round>;

    findAllRounds(): Promise<Round[]>;

    findRound(id: string): Promise<Round | null>;

    findUserRoundScore(username: string, roundId: string): Promise<UserRoundScore | null>

    findUserRoundScoreMax(roundId: string): Promise<UserRoundScore | null>
}