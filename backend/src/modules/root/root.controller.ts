import { FastifyInstance } from 'fastify'
import config from "../../config";

export async function rootController(app: FastifyInstance) {
    app.get('/', async (req, res) => {
        if (config.redirectUrl) {
            console.log('redirect')
            return res.redirect(config.redirectUrl, 301);
        }

        // Если редиректа нет — возвращаем пустой ответ
        return res.code(204).send(); // или res.send('OK')
    });
}