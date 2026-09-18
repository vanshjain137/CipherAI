import { api } from "../utils/axios.js"

export const createPayment = async (plan) => {
    try {
        const {data} = await api.post("/api/payment/create",{plan})
        return data
    } catch (error) {
        console.log(error)
        return null
    }
}


export const verifyPayment = async ({razorpay_order_id,razorpay_payment_id,razorpay_signature}) => {
    try {
        const {data} = await api.post("/api/payment/verify",{razorpay_order_id,razorpay_payment_id,razorpay_signature})
        return data
    } catch (error) {
        console.log(error)
        return null
    }
}