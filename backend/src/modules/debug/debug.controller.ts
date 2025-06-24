import { FastifyInstance } from 'fastify'
import * as os from "os";

export async function debugController(app: FastifyInstance) {
    app.get('/healthz', async (req, res) => {
        return { status: 'ok' };
    });

    app.post("/debug/kill/:host", (req, res) => {
        const current = os.hostname();
        const {host} = req.params as {host: string}
        if (host === current) {
            res.send(`Killing ${current}`);
            setTimeout(() => {
                throw new Error("Killed by webhook")
            });
        } else {
            res.status(409).send(`Current: ${current}, not matched: ${host}`);
        }
    });
}