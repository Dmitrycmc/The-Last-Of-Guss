import * as dotenv from 'dotenv'

dotenv.config()

const config = {
    port: Number(process.env.PORT) || 3000,
    jwtSecret: process.env.JWT_SECRET!,
    roundDuration: Number(process.env.ROUND_DURATION) || 60,
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379'
}

export default config