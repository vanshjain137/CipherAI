import { signInWithPopup } from 'firebase/auth';
import React, { useEffect, useState } from 'react'
import { FcGoogle } from "react-icons/fc";
import { auth, googleProvider } from '../../firebase.js';
import { login } from '../features/login.js';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../redux/userSlice.js';
import NavBar from '../components/NavBar.jsx';
import SideBar from '../components/SideBar.jsx';
import { Folder, Loader2, Menu, Plus, X } from 'lucide-react';
import { getProjects, getStarredProjects } from '../features/project.js';
import { setProjects } from '../redux/projectSlice.js';
import ProjectCard from '../components/ProjectCard.jsx';
import CreateProjectModal from '../components/CreateProjectModal.jsx';
import { me } from '../features/me.js';


function Dashboard() {

    const [loading, setLoading] = useState(false)
    const [activeSession, setActiveSession] = useState("projects")
    const [loadingProjects, setLoadingProjects] = useState(false)
    const [openModal, setOpenModal] = useState(false)
    const [mobileSideBarOpen, setMobileSideBarOpen] = useState(false)
    const dispatch = useDispatch()
    const { userData } = useSelector(state => state.user)
    const { projects, starredProjects } = useSelector(state => state.project)

    useEffect(() => {
        if (userData) {
            const syncProfile = async () => {
                const data = await me();
                if (data) dispatch(setUserData(data));
            };
            syncProfile();
        }
    }, []);

    const handleLogin = async () => {
        setLoading(true)
        const result = await signInWithPopup(auth, googleProvider)
        const token = await result.user.getIdToken()
        const data = await login(token)
        dispatch(setUserData(data))
        setLoading(false)
    }

    const fetchAllProjects = async () => {
        setLoadingProjects(true)
        const data = await getProjects()
        dispatch(setProjects(data))
        setLoadingProjects(false)
    }

    const fetchStarredProjects = async () => {
        setLoadingProjects(true)
        const data = await getStarredProjects()
        dispatch(setProjects(data))
        setLoadingProjects(false)
    }

    useEffect(() => {
        if (activeSession == "projects") {
            fetchAllProjects()
        } else {
            fetchStarredProjects()
        }
    }, [activeSession,userData])

    if (!userData) {
        return (
            <div className='relative flex h-screen w-full items-center justify-center overflow-hidden bg-slate-50 px-4 transition-colors duration-300 dark:bg-[#07070c]'>
                <div className='pointer-events-none absolute -top-32 left-1/2 hidden h-150 w-150 -translate-x-1/2 rounded-full bg-white/5 blur-[120px] dark-block' />

                <div className='relative w-full max-w-sm rounded-2xl border border-slate-200/70 bg-white/80 p-6 sm:p-8 text-center shadow-xl shadow-slate-200/50 backdrop-blur-xl dark:border-white/8 dark:bg-white/3 dark:shadow-black/40'>
                    <div className='mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-lg shadow-black/5 dark:border-transparent'>
                        <span className='text-lg font-bold text-slate-900'>AI</span>
                    </div>
                    <h2
                        className='mb-2 text-xl font-bold text-slate-900 dark:text-white'
                    >
                        Welcome to CipherAI
                    </h2>

                    <p className='mb-6 text-[13.5px] leading-relaxed text-slate-500 dark:text-slate-400'>
                        Sign in to access your projects and continue building.
                    </p>

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className='flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white py-2.5 text-[13.5px] font-medium text-slate-800 shadow-sm transition-colors duration-150 hover:bg-slate-50 disabled:opacity-70 dark:border-transparent dark:bg-white dark:hover:bg-slate-100 cursor-pointer'>
                        <FcGoogle />
                        {loading ? "Signing in..." : "Continue with Google"}
                    </button>

                    <p className='mt-5 text-[11px] text-slate-400 dark:text-slate-600'>By continuing you agree to aur Terms & Privacy Policy.</p>

                </div>
            </div>
        )
    }

    return (
        <div className='relative flex h-screen w-full flex-col overflow-hidden bg-slate-50 transition-colors duration-300 dark:bg-[#07070c]'>

            <div className='pointer-events-none absolute -top-40 left-1/3 hidden h-175 w-175 rounded-full bg-white/4 blur-[140px] dark:block' />
            <div className='pointer-events-none absolute right-0 top-1/3 hidden h-125 w-125 rounded-full bg-white/3 blur-[130px] dark:block' />

            <div className='relative flex min-h-0 flex-1 flex-col'>
                <NavBar />
                <div className='flex min-h-0 flex-1'>
                    <div className='hidden md:block'>
                        <SideBar activeSession={activeSession} setActiveSession={setActiveSession} />
                    </div>

                    {mobileSideBarOpen && (
                        <div className='fixed inset-0 z-40 md:hidden'>
                            <div onClick={() => setMobileSideBarOpen(false)} className='absolute inset-0 bg-black/40 backdrop-blur-sm' />

                            <div className='absolute left-0 top-0 h-full w-72 max-w-[80vw] bg-slate-50 shadow-2xl dark:bg-[#0a0a10]'>
                                <div className='flex items-center justify-between px-4 py-4 border-b border-slate-200/70 dark:border-white/7'>
                                    <span className='text-[13.5px] font-semibold text-slate-900 dark:text-white'>
                                        Menu
                                    </span>
                                    <button
                                        onClick={() => setMobileSideBarOpen(false)}
                                        className='flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/6'
                                        aria-label='Close menu'
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <SideBar activeSession={activeSession} setActiveSession={setActiveSession} />
                            </div>
                        </div>
                    )}

                    <div
                        className='min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 scrollbar-thin [scrollbar-color:rgba(100,116,139,0.35)_transparent] [&::-webkit-scrollbar:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-clip-padding hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 dark:hover:[&::-webkit-scrollbar-thumb]:bg-white/20'
                    >

                        <div
                            onClick={() => setMobileSideBarOpen(true)}
                            className='mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12.5px] font-medium text-slate-600 shadow-sm dark:border-white/8 dark:bg-white/4 dark:text-slate-300 md:hidden'
                        >
                            <Menu size={14} />
                            Menu
                        </div>

                        <div className='mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4'>
                            <div>
                                <h1 className='flex items-center gap-2 text-[26px] font-bold text-slate-900 dark:text-white'>
                                    Welcome Back, {" "}
                                    {(userData?.name)?.split(" ")[0] || "User"}
                                    <span>👋</span>
                                </h1>

                                <p className='mt-1 text-[13.5px] text-slate-500 dark:text-slate-400'>Ready to build something amazing today?</p>
                            </div>
                            <button className='flex w-full sm:w-auto shrink-0 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-[13.5px] font-semibold text-white shadow-sm transition-opacity duration-150 hover:opacity-90 dark:bg-white dark:text-slate-900 cursor-pointer'
                                onClick={() => setOpenModal(true)}
                            >
                                <Plus size={16} />
                                New Project
                            </button>
                        </div>

                        <div className='mb-4 flex items-center justify-between'>
                            <h2 className='text-[16px] font-semibold text-slate-900 dark:text-white'>
                                {activeSession == "starred" ? "Starred Projects" : "Recent Projects"}
                            </h2>
                        </div>

                        {loadingProjects ? (
                            <div className='flex min-h-75 items-center justify-center'>
                                <Loader2
                                    size={28}
                                    className='animate-spin text-slate-400 dark:text-slate-500'
                                />
                            </div>
                        ) : !projects || projects?.length === 0 ? (
                            <div className='mb-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/40 px-4 py-12 sm:py-16 text-center dark:border-white/10 dark:bg-white/1'>
                                <div className='mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900/5 dark:bg-white/10'>
                                    <Folder
                                        size={24}
                                        className='text-slate-500 dark:text-white'
                                    />
                                </div>

                                <h3 className='mb-1.5 text-[16px] font-semibold text-slate-900 dark:text-white'>
                                    {activeSession == "starred" ? "No starred projects" : "No projects yet"}
                                </h3>

                                <p className='mb-5 max-w-xs text-[13px] text-slate-500 dark:text-slate-500'>
                                    {activeSession == "starred" ? "Star a project to see it here." : "Create your first project and start building something amazing!"}
                                </p>

                            </div>
                        ) : (
                            <div className='mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4'>
                                {projects?.map((p, i) => (
                                    <ProjectCard project={p} />
                                ))}
                            </div>
                        )}

                    </div>
                </div>
            </div>
            {openModal && <CreateProjectModal
                open={openModal}
                onClose={() => setOpenModal(false)}
            />}

        </div>
    )



}

export default Dashboard
