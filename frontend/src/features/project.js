import { api } from "../utils/axios.js"

export const createProject = async ({name,description}) => {
    try {
        const {data} = await api.post("/api/project",{name,description})
        return data
    } catch (error) {
        console.log(error)
        return null
    }
}


export const getProjects = async () => {
    try {
        const {data} = await api.get("/api/project")
        return data
    } catch (error) {
        console.log(error)
        return []
    }
}


export const getProjectById = async (id) => {
    try {
        const {data} = await api.get(`/api/project/${id}`)
        return data
    } catch (error) {
        console.log(error)
        return null
    }
}


export const getStarredProjects = async () => {
    try {
        const {data} = await api.get("/api/project/starred")
        return data
    } catch (error) {
        console.log(error)
        return []
    }
}


export const toggleStar = async (id) => {
    try {
        const {data} = await api.patch(`/api/project/${id}`)
        return data
    } catch (error) {
        console.log(error)
        return null
    }
}


export const deleteProject = async (id) => {
    try {
        const {data} = await api.delete(`/api/project/${id}`)
        return data
    } catch (error) {
        console.log(error)
        return null
    }
}