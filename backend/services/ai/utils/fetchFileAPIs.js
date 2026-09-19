import axios from "axios"
import dotenv from "dotenv"
dotenv.config()

const File_url = process.env.FILE_SERVICE

export const createFolder = async ({projectId,parentId,name,userId}) => {
    try {
        const {data} = await axios.post(`${File_url}/create-folder`,
            {projectId,parentId,name},
            {headers:{
                "x-user-id":String(userId)
            }}
        )

        return data
    } catch (error) {
        throw new Error(error)
    }
}


export const createFile = async ({projectId,parentId,name,content="",language="plaintext",userId}) => {
    try {
        const {data} = await axios.post(`${File_url}/create-file`,
            {projectId,parentId,name,content,language},
            {headers:{
                "x-user-id":String(userId)
            }}
        )

        return data
    } catch (error) {
        throw new Error(error)
    }
}


export const updateFile = async ({name,content="",userId,id}) => {
    try {
        const {data} = await axios.post(`${File_url}/update/${id}`,
            {name,content},
            {headers:{
                "x-user-id":String(userId)
            }}
        )

        return data
    } catch (error) {
        throw new Error(error)
    }
}


export const deleteFile = async ({userId,id}) => {
    try {
        const {data} = await axios.delete(`${File_url}/${id}`,
            {headers:{
                "x-user-id":String(userId)
            }}
        )

        return data
    } catch (error) {
        throw new Error(error)
    }
}


export const getTree = async ({userId,projectId}) => {
    try {
        const {data} = await axios.get(`${File_url}/tree/${projectId}`,
            {headers:{
                "x-user-id":String(userId)
            }}
        )

        return data
    } catch (error) {
        throw new Error(error)
    }
}


export const getFile = async ({userId,id}) => {
    try {
        const {data} = await axios.get(`${File_url}/${id}`,
            {headers:{
                "x-user-id":String(userId)
            }}
        )

        return data
    } catch (error) {
        throw new Error(error)
    }
}