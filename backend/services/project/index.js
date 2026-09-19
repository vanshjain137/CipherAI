import dotenv from "dotenv"
dotenv.config()
import express from "express"
import { connectDb } from "./config/db.js"
import router from "./routes/project.route.js"


const port = 8002

const app = express()
app.use(express.json())
app.use("/",router)
app.get("/", (req,res)=>{
    res.json({"message":"hello from project service"})
})

app.listen(port, ()=>{
    connectDb()
    console.log(`project service started at ${port}`)
})