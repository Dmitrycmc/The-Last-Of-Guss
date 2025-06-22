import { FastifyInstance } from 'fastify'
import authService from './auth.service'
import {BadRequestError} from "../../errors/app-error";

export async function authController(app: FastifyInstance) {
    app.post('/register', async (req, res) => {
        const { username, password } = req.body as any
        if (!username || !password) {
            throw new BadRequestError('Username and password cannot be empty')
        }
        const token = await authService.registerUser(username, password)
        return { token }
    })

    app.post('/login', async (req, res) => {
        const { username, password } = req.body as any
        if (!username || !password) {
            throw new BadRequestError('Username and password cannot be empty')
        }
        const token = await authService.loginUser(username, password)
        return { token }
    })
}