import {Prisma, User} from "../../generated/prisma";

export interface IDataBase {
    createUser(user: Prisma.UserCreateInput): Promise<User>;

    findUser(username: string): Promise<User | null>;
}