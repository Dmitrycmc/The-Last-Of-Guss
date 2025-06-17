import bcrypt from "bcrypt";
import {generateToken} from "../../utils/jwt";
import {resolveRole} from "../../utils/roles";
import {database} from "../../infra/database";

class AuthService {
    async registerUser(username: string, rawPassword: string): Promise<string> {
        const hashedPassword = await bcrypt.hash(rawPassword, 10)
        const role = resolveRole(username)
        const user = await database.createUser({ username, password: hashedPassword, role })

        return generateToken(user)
    }

    async loginUser(username: string, password: string): Promise<string> {
        const user = await database.findUser(username)
        if (!user) throw new Error(`User '${username}' not found`)

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) throw new Error('Invalid password')

        return generateToken(user)
    }
}

export default new AuthService()