import React from 'react'
import { motion } from "motion/react"
import { TerminalSquare, X } from 'lucide-react'
import Terminal from './Terminal.jsx'
import { useSelector } from "react-redux"

function BottomPanel({ projectId, onClose }) {

    const {currentProject} = useSelector(state=>state.project)
    projectId = currentProject?._id
    const userId = currentProject?.owner

    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 256, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className='flex shrink-0 flex-col overflow-hidden border-t border-white/6 bg-[#111113]'
        >

            <div className='flex h-9 shrink-0 items-center justify-between border-b border-white/6 px-3'>
                <div className='flex items-center gap-1'>
                    <h2 className='relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-semibold tracking-wide transition-colors text-white'>
                        <TerminalSquare size={13} className='relative' />
                        <span className='relative uppercase'>Terminal</span>
                    </h2>
                </div>

                <button
                    onClick={onClose}
                    title='Close panel'
                    className='rounded-md p-1 text-zinc-500 hover:bg-white/10 hover:text-white cursor-pointer'
                >
                    <X size={14}/>
                </button>

            </div>

            <div className='min-h-0 flex-1'>
                <Terminal projectId={projectId} userId={userId}/>
            </div>

        </motion.div>
    )
}

export default BottomPanel
