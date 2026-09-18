import { createSlice } from "@reduxjs/toolkit";

const projectSlice = createSlice({
    name: "user",
    initialState: {
        projects: [],
        currentProject:null
    },
    reducers: {
        setProjects: (state, action) => {
            state.projects = action.payload
        },
        setCurrentProject: (state, action) => {
            state.currentProject = action.payload
        },
        addNewProject: (state, action) => {
            state.projects.unshift(action.payload)
        },
        starProject: (state, action) => {
            const project = state.projects.find(p => p._id == action.payload)
            if (project) {
                project.starred = !project.starred
            }
        },
        setDeleteProject: (state, action) => {
            state.projects = state.projects.filter(p => p._id != action.payload)
        }
    }
})

export const { setProjects, addNewProject, starProject, setDeleteProject, setCurrentProject } = projectSlice.actions
export default projectSlice.reducer