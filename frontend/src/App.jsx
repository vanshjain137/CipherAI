import React, { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import { me } from './features/me.js'
import { useDispatch } from 'react-redux'
import { setUserData } from './redux/userSlice.js'
import ProjectPage from './pages/ProjectPage.jsx'
import Plan from './pages/Plan.jsx'

function App() {

  const dispatch = useDispatch()
  useEffect(()=>{
    const fetch = async () => {
      const data = await me()
      dispatch(setUserData(data))
    }
    fetch()
  },[])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard/>}/>
        <Route path="/project/:id" element={<ProjectPage/>}/>
        <Route path="/plan" element={<Plan/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
