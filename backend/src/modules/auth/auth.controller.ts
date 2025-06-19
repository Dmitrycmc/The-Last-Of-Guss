import { FastifyInstance } from 'fastify'
import authService from './auth.service'

export async function authController(app: FastifyInstance) {
    app.post('/login', async (req, res) => {
        const { username, password } = req.body as any
        const token = await authService.loginUser(username, password)
        return { token }
    })

    app.post('/register', async (req, res) => {
        const { username, password } = req.body as any
        const token = await authService.registerUser(username, password)
        return { token }
    })
}