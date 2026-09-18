import File from "../models/file.model.js"
import { buildTree } from "../utils/buildTree.js"

export const createRootFolder = async(req,res)=>{
    try {
        const {projectId, projectName} = req.body
        const userId = req.headers["x-user-id"]
        if(!projectId || !projectName){
            return res.status(400).json({message:"projectId and name is required!"})
        }

        const existingRootFolder = await File.findOne({
            projectId,
            parentId: null,
            isDeleted: false
        })

        if(existingRootFolder){
            return res.status(400).json({message:"root folder already exists"})
        }

        const rootFolder = await File.create({
            owner: userId,
            name: projectName,
            projectId,
            type: "folder",
            parentId: null
        })

        return res.status(201).json(rootFolder)

    } catch (error) {
        res.status(500).json({message:`create root folder error ${error}`})
    }
}


export const createFolder = async(req,res)=>{
    try {
        const {projectId, name, parentId} = req.body
        const userId = req.headers["x-user-id"]
        if(!projectId || !name || parentId === undefined){
            return res.status(400).json({message:"projectId, parentId and name are required!"})
        }

        const exist = await File.findOne({
            name,
            projectId,
            parentId,
            isDeleted: false
        })

        if(exist){
            return res.status(400).json({message:"folder already exists"})
        }

        const folder = await File.create({
            owner: userId,
            name,
            projectId,
            type: "folder",
            parentId
        })

        return res.status(201).json(folder)

    } catch (error) {
        res.status(500).json({message:`create folder error ${error}`})
    }
}


export const createFile = async(req,res)=>{
    try {
        const {projectId, name, parentId, content="",language="plaintext"} = req.body
        const userId = req.headers["x-user-id"]
        if(!projectId || !name || parentId === undefined){
            return res.status(400).json({message:"projectId, parentId and name are required!"})
        }

        const exist = await File.findOne({
            name,
            projectId,
            parentId,
            isDeleted: false
        })

        if(exist){
            return res.status(400).json({message:"file already exists"})
        }

        const extension = name.includes(".")?name.split(".").pop():""

        const file = await File.create({
            owner: userId,
            name,
            projectId,
            type: "file",
            language,
            content,
            extension,
            size:content.length,
            parentId: parentId || null
        })

        return res.status(201).json(file)

    } catch (error) {
        res.status(500).json({message:`create file error ${error}`})
    }
}


export const updateFile = async(req,res)=>{
    try {
        const {name, content} = req.body
        const userId = req.headers["x-user-id"]

        const file = await File.findOne({
            _id: req.params.id,
            owner: userId,
            isDeleted: false
        })

        if(!file){
            return res.status(400).json({message:"file not found"})
        }

        if(name){
            file.name= name
            file.extension = name.includes(".")?name.split(".").pop():""
        }

        if(content!=undefined){
            file.content= content,
            file.size= content.length
        }

        await file.save()

        return res.status(200).json(file)

    } catch (error) {
        res.status(500).json({message:`update file error ${error}`})
    }
}


export const deleteFile = async(req,res)=>{
    try {
        const userId = req.headers["x-user-id"]

        const file = await File.findByIdAndUpdate(req.params.id,{
            isDeleted: true
        })

        return res.status(200).json(file)

    } catch (error) {
        res.status(500).json({message:`delete file error ${error}`})
    }
}


export const getFile = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"]

        const file = await File.findOne({
            _id: req.params.id,
            owner: userId,
            isDeleted: false
        })

        if(!file){
            return res.status(400).json({message:"file not found"})
        }

        return res.status(200).json(file)

    } catch (error) {
        res.status(500).json({message:`get file error ${error}`})
    }
}


export const getTree = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"]
        const {projectId} = req.params

        const files = await File.find({
            projectId,
            owner: userId,
            isDeleted: false
        }).sort({
            name:1,
            type:-1
        })

        const tree = await buildTree(files)

        return res.status(200).json(tree)

    } catch (error) {
        res.status(500).json({message:`get tree error ${error}`})
    }
}