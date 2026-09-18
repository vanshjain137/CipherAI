import { api } from "../utils/axios.js"

export const logout = async () => {
    try {
        const {data} = await api.get("/api/auth/logout")
        return data
    } catch (error) {
        console.log(error)
        return null
    }
}