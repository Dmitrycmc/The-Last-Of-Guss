import {IDataBase} from "./database.interface";
import {Prisma, PrismaClient, User} from "../../generated/prisma";

const index = new PrismaClient()

class PrismaDataBase implements IDataBase {
    constructor(private _prisma) {}

    async createUser(data: Prisma.UserCreateInput): Promise<User> {
        return this._prisma.user.create({data})
    }

    async findUser(username: string): Promise<User | null> {
        return this._prisma.user.findUnique({ where: { username } })
    }
}

export const database: IDataBase = new PrismaDataBase(index)