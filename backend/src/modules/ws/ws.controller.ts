import WebSocket, {WebSocketServer} from "ws";
import {FastifyInstance} from "fastify";
import config from "../../config";

const sockets: WebSocket[] = []
export const broadcast = (message: any) => {
    sockets.forEach(ws => ws.send(JSON.stringify(message)))
}

export default (app: FastifyInstance) => {
    const wss = new WebSocketServer({ server: app.server })

    wss.on('connection', (ws) => {
        sockets.push(ws)

        console.log({instance: config.instance})
    })

}