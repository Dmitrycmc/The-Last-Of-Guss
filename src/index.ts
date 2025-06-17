import Fastify from 'fastify'

const app = Fastify()

app.get('/ping', async () => ({ pong: true }))

app.listen({ port: 3000 }, err => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log('Server is running on http://localhost:3000')
})