import Fastify from 'fastify'
import config from './config'

const app = Fastify()

app.get('/ping', async () => ({ pong: true }))

app.listen({ port: config.port }, err => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log('Server is running on http://localhost:3000')
})