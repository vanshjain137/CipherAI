import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    plan:{
        type:String,
        enum:["pro","team"],
        required: true
    },
    amount:{
        type:Number,
        required:true
    },
    credits:{
        type:Number,
        required: true
    },
    currency:{
        type:String,
        default:"INR"
    },
    razorpayOrderId:{
        type:String,
        required: true
    },
    razorpayPaymentId:{
        type:String,
        default:null
    },
    status:{
        type:String,
        enum:["paid","created","failed"],
        default:"created"
    }
},{timestamps: true})

const Payment = mongoose.model("Payment",paymentSchema)
export default Payment