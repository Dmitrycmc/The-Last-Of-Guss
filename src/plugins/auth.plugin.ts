import jwt from 'jsonwebtoken'
import config from '../config'

export const authPlugin = (app) => {
    app.decorateRequest('user', null)

    app.addHook('preHandler', async (req, res) => {
        const auth = req.headers.authorization
        if (!auth || !auth.startsWith('Bearer ')) {
            return
        }

        const token = auth.split(' ')[1]

        try {
            req.user = jwt.verify(token, config.jwtSecret) // { id, username, role }
        } catch (err) {
            req.log.warn('Invalid JWT')
        }
    })
}