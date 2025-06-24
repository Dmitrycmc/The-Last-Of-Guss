import Fastify from 'fastify'
import config from './config'
import {authController} from "./modules/auth/auth.controller";
import {roundController} from "./modules/round/round.controller";
import {authPlugin} from "./plugins/auth.plugin";
import {errorHandlerPlugin} from "./plugins/error-handler.plugin";
import {rootController} from "./modules/root/root.controller";
import {debugController} from "./modules/debug/debug.controller";

const app = Fastify({
    logger: true
})

authPlugin(app)
app.register(errorHandlerPlugin)
app.register(debugController)
app.register(rootController)
app.register(authController)
app.register(roundController)

app.listen({ port: config.port, host: '0.0.0.0' }, err => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server is running on http://localhost:${config.port}`)
})
