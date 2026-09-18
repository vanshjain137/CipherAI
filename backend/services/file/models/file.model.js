import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "File",
        default: null
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["file", "folder"],
        required: true
    },
    extension: {
        type: String,
        default: ""
    },
    language: {
        type: String,
        default: "plaintext"
    },
    content: {
        type: String,
        default: ""
    },
    size: {
        type: Number,
        default: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const File = mongoose.model("File", fileSchema)
export default File