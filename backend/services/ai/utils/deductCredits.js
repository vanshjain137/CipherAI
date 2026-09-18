import axios from "axios"

export const deductCredits = async ({ userId, amount }) => {
    try {
        const { data } = await axios.post(`${process.env.AUTH_SERVICE}/user/deduct-credits`, { userId, amount })
        return data
    } catch (error) {
        console.log(error)
        return null
    }

}