import dotenv from "dotenv"
dotenv.config()
import express from "express"
import { connectDb } from "./config/db.js"
import router from "./routes/auth.route.js"


const port = 8001

const app = express()
app.use(express.json())

app.use("/",router)

app.get("/", (req,res)=>{
    res.json({"message":"hello from auth"})
})

app.listen(port, ()=>{
    connectDb()
    console.log(`auth started at ${port}`)
})