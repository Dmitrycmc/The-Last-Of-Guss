import {WebSocketServer} from "ws";
import {FastifyInstance} from "fastify";

export default (app: FastifyInstance) => {
    const wss = new WebSocketServer({ server: app.server })

    wss.on('connection', (ws) => {
        console.log('✅ WS connection established')

        ws.on('message', (msg) => {
            console.log('📨 Received:', msg.toString())
            ws.send('pong')
        })
    })

}