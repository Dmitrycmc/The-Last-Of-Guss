import bcrypt from "bcrypt";
import {generateToken} from "../../utils/jwt";
import {resolveRole} from "../../utils/roles";
import database from "../../infra/database";
import {BadRequestError} from "../../errors/app-error";

class AuthService {
    async loginRegisterUser(username: string, password: string): Promise<string> {
        const user = await database.findUser(username)
        if (!user) {
            const hashedPassword = await bcrypt.hash(password, 10)
            const role = resolveRole(username)

            const user = await database.createUser({ username, password: hashedPassword, role })

            return generateToken(user)
        }

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) throw new BadRequestError('Invalid password')

        return generateToken(user)
    }
}

export default new AuthService()