import bcrypt from "bcrypt";
import {generateToken} from "../../utils/jwt";
import {resolveRole} from "../../utils/roles";
import database from "../../infra/database";
import {BadRequestError} from "../../errors/app-error";

class AuthService {
    async registerUser(username: string, password: string): Promise<string> {
        const hashedPassword = await bcrypt.hash(password, 10)
        const role = resolveRole(username)

        let user = await database.createUser({ username, password: hashedPassword, role })

        return generateToken(user)
    }

    async loginUser(username: string, password: string): Promise<string> {
        const user = await database.findUser(username)
        if (!user) {
            throw new BadRequestError("User not exists")
        }

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
            throw new BadRequestError('Invalid password')
        }

        return generateToken(user)
    }
}

export default new AuthService()