import { FastifyInstance } from 'fastify'
import authService from './auth.service'
import {BadRequestError} from "../../errors/app-error";

export async function authController(app: FastifyInstance) {
    app.post('/login-register', async (req, res) => {
        const { username, password } = req.body as any
        if (!username || !password) {
            throw new BadRequestError('Username and password cannot be empty')
        }
        if (!/^[a-z0-9]{3,}$/.test(username)) {
            throw new BadRequestError('Username must be at least 3 characters, and contain only a-z and digits')
        }
        const token = await authService.loginRegisterUser(username, password)
        return { token }
    })
}