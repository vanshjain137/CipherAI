import mongoose from "mongoose"

export const connectDb = async () => {
    try {
        await mongoose.connect(process.env.FILE_MONGO_URI || process.env.MONGODB_URI)
        console.log("db connected")
    } catch (error) {
        console.log(error)
    }
}