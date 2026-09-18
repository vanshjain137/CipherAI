import mongoose from "mongoose"

export const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("db connected")
    } catch (error) {
        console.log(error)
    }
}