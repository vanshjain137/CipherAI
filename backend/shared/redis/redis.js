import dotenv from "dotenv"
dotenv.config()
import Redis from "ioredis"

if (!process.env.REDIS_URL) {
    console.warn("⚠️ REDIS_URL is undefined! Check that your .env file has REDIS_URL set.")
}

const redis = new Redis(process.env.REDIS_URL)


redis.on("connect",()=>{
    console.log("redis connected")
})

redis.on("error", (err) => {
    console.error("Redis connection error:", err.message)
})

export default redis