import * as dotenv from 'dotenv'

dotenv.config()

const config = {
    port: Number(process.env.PORT) || 3000,
    jwtSecret: process.env.JWT_SECRET,
    roundDuration: Number(process.env.ROUND_DURATION) || 30,
    cooldownDuration: Number(process.env.COOLDOWN_DURATION) || 30,
    redirectUrl: process.env.REDIRECT_URL,
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    instance: process.env.INSTANCE
}

export default config