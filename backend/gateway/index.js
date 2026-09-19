import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import proxy from "express-http-proxy"
import { createProxyMiddleware } from "http-proxy-middleware"
import { protect } from "./middleware/protect.js"
import { getCurrentUser } from "./controllers/user.controller.js"
import { proxyWithHeader } from "./utils/proxyWithHeader.js"

const port = process.env.PORT || 8000

const app = express()
app.set("trust proxy", 1)
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))

app.use(cookieParser())
app.use(morgan("dev"))

app.use((req, res, next) => {
    console.log(`=== Request to ${req.path} ===`)
    console.log("Cookies received:", req.cookies)
    next()
})

const wsProxy = createProxyMiddleware({
    target: process.env.TERMINAL_SERVICE,
    ws: true,
    changeOrigin: true
});
app.use("/socket.io", wsProxy);

app.use("/api/auth", proxy(process.env.AUTH_SERVICE))
app.use("/api/project",protect,proxyWithHeader(process.env.PROJECT_SERVICE))
app.use("/api/file",protect,proxyWithHeader(process.env.FILE_SERVICE))
app.use("/api/ai",protect,proxyWithHeader(process.env.AI_SERVICE))
app.use("/api/payment",protect,proxyWithHeader(process.env.PAYMENT_SERVICE))
app.get("/api/me",protect,getCurrentUser)
app.get("/", (req,res)=>{
    res.json({"message":"hello from gateway"})
})

const server = app.listen(port, ()=>{
    console.log(`gateway started at ${port}`)
})

server.on('upgrade', wsProxy.upgrade);