import { FastifyInstance } from 'fastify'

export async function debugController(app: FastifyInstance) {
    app.get('/healthz', async (req, res) => {
        return { status: 'ok' };
    });

    app.get('/debug/kill', async (req, res) => {
        res.code(204).send();
        setTimeout(() => {
            throw new Error("Killed by webhook");
        });
    });
}