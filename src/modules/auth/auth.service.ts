import {User, WithId} from "./types";
import { v4 as uuidv4 } from 'uuid'
import bcrypt from "bcrypt";
import {generateToken} from "../../utils/jwt";
import {resolveRole} from "../../utils/roles";

class AuthService {
    private _list: WithId<User>[] = []

    async createUser(data: User): Promise<WithId<User>> {
        const record = {
            id: uuidv4(),
            ...data
        }
        this._list.push(record)
        console.log("Auth service. createUser", record)
        // prisma.user.create({ data })
        return record
    }

    async findUserByName(username: string): Promise<WithId<User> | null> {
        console.log("Auth service. findUserByName", username)
        // prisma.user.findUnique({ where: { username } })
        return this._list.find(u => u.username === username) ?? null
    }

    async registerUser(username: string, rawPassword: string): Promise<string> {
        const existing = await this.findUserByName(username)
        if (existing) throw new Error(`User '${username}' already registered`)

        const hashedPassword = await bcrypt.hash(rawPassword, 10)
        const role = resolveRole(username)
        const user = await this.createUser({ username, password: hashedPassword, role })

        return generateToken(user)
    }

    async loginUser(username: string, password: string): Promise<string> {
        const user = await this.findUserByName(username)
        if (!user) throw new Error(`User '${username}' not found`)

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) throw new Error('Invalid password')

        return generateToken(user)
    }
}

export default new AuthService()