import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { motion } from "motion/react"
import { Code2, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'

function TopBar({ showPreview, setShowPreview }) {

    const { currentProject } = useSelector(state => state.project)

    return (
        <div className='relative flex h-12 items-center justify-between border-b border-white/6 bg-[#111113]/90 px-4 backdrop-blur-xl'>
            <div className='flex items-center gap-3'>
                <Link to="/" className='text-white text-lg font-bold transition-opacity hover:opacity-80 cursor-pointer'>
                    CipherAI
                </Link>

                <div className='h-4 w-px bg-white/10' />

                <div className='flex items-center gap-2'>
                    <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[13px]'>
                        🗂️
                    </div>
                    <div className='max-w-55 truncate text-sm font-medium text-zinc-300'>
                        {currentProject?.name || "project"}
                    </div>
                </div>
            </div>

            <div className='flex items-center gap-1.5'>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPreview?.((v) => !v)}
                    title={showPreview ? "Show Editor" : "Show Preview"}
                    className={`relative flex items-center justify-center rounded-lg p-2 transition-colors ${showPreview ? "text-sky-400" : "text-zinc-400 hover:text-zinc-200"
                        }`}
                >
                    <motion.div
                        className='absolute inset-0 rounded-lg bg-white/6'
                        transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
                    />

                    {showPreview ? <Eye size={16} className='relative cursor-pointer' /> : <Code2 size={16} className='relative cursor-pointer' />}

                </motion.button>
            </div>
        </div>
    )
}

export default TopBar
