import axios from "axios"

export const addCredits = async ({ userId, credits }) => {
    try {
        const { data } = await axios.post(`${process.env.AUTH_SERVICE}/user/add-credits`, { userId, credits })
        return data
    } catch (error) {
        console.log(error)
        return null
    }

}