import React from 'react'
import { motion } from "motion/react"
import { Coins, Folder, Star, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

function SideBar({ activeSession, setActiveSession }) {

    const navigate = useNavigate()
    const {userData} = useSelector(state=>state.user)

    return (
        <div className='flex h-full w-64 shrink-0 flex-col border-r border-slate-200/70 bg-white/60 px-3 py-5 font-sans backdrop-blur-xl transition-colors duration-300 dark:border-white/6 dark:bg-white/2 '>
            <div className='flex flex-col gap-1'>
                <motion.div
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveSession("projects")}
                    className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors duration-150 cursor-pointer ${activeSession == "projects" ? "text-slate-900 dark:text-white" : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/4 dark:hover:text-slate-200"}`}
                >
                    {activeSession == "projects" && (
                        <div className='absolute inset-0 rounded-lg border border-slate-900/10 bg-slate-900/5 dark:border-white/10 dark:bg-white/10' />
                    )}
                    <Folder
                        size={17}
                        strokeWidth={2}
                        className='relative'
                    />
                    <span className='relative'>
                        Projects
                    </span>
                </motion.div>

                <motion.div
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveSession("starred")}
                    className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors duration-150 cursor-pointer ${activeSession == "starred" ? "text-slate-900 dark:text-white" : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/4 dark:hover:text-slate-200"}`}
                >

                    {activeSession == "starred" && (
                        <div className='absolute inset-0 rounded-lg border border-slate-900/10 bg-slate-900/5 dark:border-white/10 dark:bg-white/10' />
                    )}

                    <Star
                        size={17}
                        strokeWidth={2}
                        className='relative'
                    />
                    <span className='relative'>
                        Starred
                    </span>

                </motion.div>
            </div>

            <div className='my-4 h-px bg-slate-200/70 dark:bg-white/6' />

            <div className='mb-3 rounded-xl border border-slate-200/70 bg-white/70 p-3.5 shadow-sm backdrop-blur-xl dark:border-white/7 dark:bg-white/3 dark:shadow-none'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                        <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900/5 text-slate-700 dark:bg-white/10 dark:text-white'>
                            <Coins size={14}/>
                        </div>
                        <span className='text-[12px] font-medium text-slate-600 dark:text-slate-400'>
                            AI Credits
                        </span>
                        <span className='text-[15px] font-bold text-slate-900 dark:text-white'>
                            {userData?.credits || 0}
                        </span>
                    </div>
                </div>
            </div>


            <div className='my-4 h-px bg-slate-200/70 dark:bg-white/6' />

            <div className='rounded-xl border border-slate-200/70 bg-white/70 p-3.5 shadow-sm backdrop-blur-xl dark:border-white/7 dark:bg-white/3 dark:shadow-none'>
                <p className='mb-1 text-[12.5px] font-medium text-slate-700 dark:text-slate-300'>Upgrade Plan</p>
                <p className='mb-3 text-[11.5px] leading-snug text-slate-400 dark:text-slate-500'>Upgrade to Pro for more credits</p>
                <motion.button
                    onClick={()=>navigate("/plan")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className='flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-900 py-2 text-[12.5px] cursor-pointer font-semibold text-white shadow-sm transition-opacity duration-150 hover:opacity-90 dark:bg-white dark:text-slate-900'
                >
                    <Zap size={13} fill='currentColor' />
                    Upgrade Now
                </motion.button>
            </div>

        </div>
    )
}

export default SideBar
