import express from "express"
import dotenv from "dotenv"
import { connectDb } from "./config/db.js"
import router from "./routes/ai.routes.js"

dotenv.config()

const port = process.env.PORT || 8004

const app = express()
app.use(express.json())
app.use("/",router)

app.get("/", (req,res)=>{
    res.json({"message":"hello from ai service"})
})

app.listen(port, ()=>{
    connectDb()
    console.log(`ai service started at ${port}`)
})