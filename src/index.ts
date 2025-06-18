import Fastify from 'fastify'
import config from './config'
import {authRoutes} from "modules/auth/auth.controller";
import {roundRoutes} from "modules/round/round.controller";
import {authPlugin} from "plugins/auth.plugin";
import {errorHandlerPlugin} from "plugins/error-handler.plugin";

async function main() {
    const app = Fastify({
        logger: true
    })

    authPlugin(app)
    app.register(errorHandlerPlugin)
    app.register(authRoutes)
    app.register(roundRoutes)

    app.listen({ port: config.port }, err => {
        if (err) {
            console.error(err)
            process.exit(1)
        }
        console.log('Server is running on http://localhost:3000')
    })
}

main()