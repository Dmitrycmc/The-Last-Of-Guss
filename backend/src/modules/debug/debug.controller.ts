import { FastifyInstance } from 'fastify'
import * as os from "os";

export async function debugController(app: FastifyInstance) {
    app.get('/healthz', async (req, res) => {
        return { status: 'ok' };
    });

    app.get("/debug/kill/:host", (req, res) => {
        const current = os.hostname();
        const {host} = req.params as {host: string}
        if (host === current) {
            res.send(`Killing ${current}`);
            setTimeout(() => process.exit(1));
        } else {
            res.send(`Current: ${current}, not matched: ${host}`);
        }
    });
}