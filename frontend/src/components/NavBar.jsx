import { ChevronDown, Code2, LogOut } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { FiMoon } from "react-icons/fi";
import { IoSunnyOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux"
import { logout } from '../features/logout.js';
import { setUserData } from '../redux/userSlice.js';


function NavBar() {

    const [isDark, setIsDark] = useState(true)
    const [menuOpen, setMenuOpen] = useState(false)
    const dispatch = useDispatch()
    const { userData } = useSelector(state => state.user)
    const name = userData.name || "Guest"
    const initials = name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()

    const handleLogout = async () => {
        await logout()
        dispatch(setUserData(null))
    }

    useEffect(() => {
        if (typeof window == undefined) return;
        const theme = window.localStorage.getItem("theme")
        const dark = theme ? theme == "dark" : true
        document.documentElement.classList.toggle("dark", dark)
        setIsDark(dark)
    }, [])

    const toggleTheme = () => {
        const next = !isDark
        setIsDark(next)
        document.documentElement.classList.toggle("dark", next)
        window.localStorage.setItem("theme", next ? "dark" : "light")
    }

    return (
        <div className='w-full h-16 bg-white/70 dark:bg-white/3 backdrop-blur-xl border-b border-slate-200/70 dark:border-white/7 flex items-center px-6 gap-6 font-sans transition-colors duration-300'>
            <div className="flex items-center gap-2 select-none cursor-pointer">
                <Code2
                    className="w-6 h-6 text-violet-600 dark:text-violet-400"
                    strokeWidth={2}
                />
                <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Cipher<span className="text-violet-600 dark:text-violet-400">AI</span>
                </span>
            </div>
            <div className='flex-1' />
            <div className='flex items-center gap-2 shrink-0'>
                <button
                    onClick={toggleTheme}
                    className='w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/6 transition-colors duration-150 cursor-pointer'
                >
                    {isDark ? <FiMoon size={18} /> : <IoSunnyOutline size={18} />}
                </button>

                <div className='relative ml-1'>
                    <button
                        onClick={() => setMenuOpen(p => !p)}
                        className='flex items-center gap-2 pl-1.5 pr-2 h-10 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-white/6 transition-colors duration-150'>
                        <div className='w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-200 dark:to-white flex items-center justify-center overflow-hidden ring-1 ring-black/5 dark:ring-white/20'>
                            <span className='text-[12px] font-semibold text-white dark:text-slate-900'>
                                {initials}
                            </span>
                        </div>
                        <span className='text-[13.5px] font-medium text-slate-700 dark:text-slate-200 hidden sm:inline'>{name}</span>
                        <ChevronDown size={14}
                            className={`text-slate-400 dark:text-slate-500 transition-transform duration-150 ${menuOpen ? "rotate-180" : ""
                                }`}
                        />
                    </button>

                    {menuOpen && (
                        <div className='absolute right-0 mt-2 w-52 bg-white/95 dark:bg-[#12121c]/95 backdrop-blur-xl border border-slate-200 dark:border-white/8 rounded-xl shadow-xl py-1.5 z-50 animate-[fadeIn_0.15s_ease-out]'>
                            <div className='px-3.5 py-2.5 border-b border-slate-100 dark:border-white/6 flex items-center gap-2.5'>

                                <div className='w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-200 dark:to-white flex items-center justify-center shrink-0 ring-1 ring-black/5 dark:ring-white/20'>
                                    <span className='text-[12px] font-semibold text-white dark:text-slate-900'>
                                        {initials}
                                    </span>
                                </div>

                                <div className='min-w-0'>
                                    <p className='text-[13px] font-medium text-slate-800 dark:text-slate-200 truncate'>{name}</p>
                                    <p className='text-[11px] text-slate-400 dark:text-slate-500 truncate'>{userData?.email}</p>
                                </div>
                            </div>

                            <button
                            onClick={handleLogout}
                            className='w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-150 cursor-pointer'>
                                <LogOut size={15} />
                                Logout
                            </button>


                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default NavBar
