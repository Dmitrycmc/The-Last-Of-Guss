import { FastifyInstance } from 'fastify'
import authService from './auth.service'

export async function authRoutes(app: FastifyInstance) {
    app.post('/login', async (req, res) => {
        const { username, password } = req.body as any
        try {
            const token = await authService.loginUser(username, password)
            return { token }
        } catch (err: any) {
            return res.status(err.status ?? 401).send({ error: err.message })
        }
    })

    app.post('/register', async (req, res) => {
        const { username, password } = req.body as any
        try {
            const token = await authService.registerUser(username, password)
            return { token }
        } catch (err: any) {
            return res.status(err.status ?? 400).send({ error: err.message })
        }
    })
}