import * as dotenv from 'dotenv'

dotenv.config()

const config = {
    port: Number(process.env.PORT) || 3000,
    jwtSecret: process.env.JWT_SECRET!,
    roundDuration: Number(process.env.ROUND_DURATION) || 60,
    cooldownDuration: Number(process.env.COOLDOWN_DURATION) || 30,
}

export default config