import { FastifyInstance } from 'fastify'
import authService from './auth.service'
import {BadRequestError} from "../../errors/app-error";

export async function authController(app: FastifyInstance) {
    app.post('/register', async (req, res) => {
        const { username, password } = req.body as any
        if (!username || !password) {
            throw new BadRequestError('Username and password cannot be empty')
        }
        if (!/^[a-z0-9]{3,}$/.test(username)) {
            throw new BadRequestError('Username must be at least 3 characters, and contain only a-z and digits')
        }
        return { token: await authService.registerUser(username, password) }
    })

    app.post('/login', async (req, res) => {
        const { username, password } = req.body as any
        if (!username || !password) {
            throw new BadRequestError('Username and password cannot be empty')
        }
        if (!/^[a-z0-9]{3,}$/.test(username)) {
            throw new BadRequestError('Username must be at least 3 characters, and contain only a-z and digits')
        }
        return { token: await authService.loginUser(username, password) }
    })

}