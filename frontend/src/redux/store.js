import { configureStore } from '@reduxjs/toolkit'
import userReducer from "./userSlice.js"
import projectReducer from "./projectSlice.js"

export const store = configureStore({
  reducer: {
    user: userReducer,
    project: projectReducer
  },
})