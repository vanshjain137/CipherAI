import { api } from "../utils/axios.js"

export const me = async () => {
    try {
        const {data} = await api.get("/api/me")
        return data
    } catch (error) {
        console.log(error)
        return null
    }
}