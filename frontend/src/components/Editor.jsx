import { AnimatePresence, motion } from 'motion/react'
import React, { useEffect, useState } from 'react'
import { getFileIcon } from '../utils/customizeIcon.js'
import { Check, Circle, Loader2, Save, X } from 'lucide-react'
import { updateFile } from '../features/file.js'
import MonacoEditor from '@monaco-editor/react';

function Editor({ activeTab, openTabs, setOpenTabs, setActiveTab, reloadTree }) {

    useEffect(()=>{
        setCode(activeTab?.content || "")
    },[activeTab?._id])

    const [saving, setSaving] = useState(false)
    const [justSaved, setJustSaved] = useState(false)
    const [code, setCode] = useState("")

    const handleCloseTab = (id) => {
        const result = openTabs.filter(tab => tab?._id != id)
        setOpenTabs(result)

        if(activeTab?._id === id){
            setActiveTab(result.length > 0 ? result[result.length - 1] : null)
        }
    }

    if(!activeTab)return (
        <div className='flex flex-1 flex-col items-center justify-center gap-3 bg-[#0a0a0c] text-zinc-600'>
            <div className='flex h-14 w-14 items-center justify-center rounded-2xl border border-white/6 bg-white/2'>
                <Circle size={22} className='text-zinc-700'/>
            </div>
            <div className='flex flex-col items-center gap-1'>
                <span className='text-sm font-medium text-zinc-400'>
                    No File Open
                </span>
                <span className='text-xs text-zinc-600'>
                    Select a file from Explorer to start editing
                </span>
            </div>
        </div>
    )

    const save = async () => {
        if (!activeTab) return;
        try {
            setSaving(true)
            await updateFile({ name: activeTab?.name, content: code, id: activeTab?._id })
            setActiveTab({ ...activeTab, content: code })
            setOpenTabs((tabs) => tabs.map((tab) => tab._id == activeTab._id ? { ...tab, content: code } : tab))
            if (reloadTree) await reloadTree();
            setSaving(false)
            setJustSaved(true)
            setTimeout(() => {
                setJustSaved(false)
            }, 1500)
        } catch (error) {
            setSaving(false)
            console.log(error)
        }
    }

    const ActiveIcon = getFileIcon(activeTab?.name).icon
    const activeColor = getFileIcon(activeTab?.name).color

    return (
        <div className='flex flex-1 flex-col bg-[#0a0a0c]'>
            <div className='flex h-10 shrink-0 items-center overflow-x-auto border-b border-white/6 bg-[#111113]/90'>
                <AnimatePresence initial={false}>
                    {openTabs.map((tab) => {
                        const active = activeTab?._id == tab?._id
                        const { icon: Icon, color } = getFileIcon(tab?.name)

                        return (
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.15 }}
                                onClick={() => setActiveTab(tab)}
                                className={`group relative flex h-full cursor-pointer items-center gap-2 whitespace-nowrap border-r border-white/5 px-3.5 transition-colors ${active ? "bg-[#0a0a0c] text-white" : "text-zinc-500 hover:bg-white/2 hover:text-zinc-300"}`}
                            >

                                <Icon size={14} className={`${color}`} />
                                <span className='text-[13px]'>{tab?.name}</span>

                                <button
                                    className='rounded p-0.5 text-zinc-500 opacity-0 hover:bg-white/10 hover:text-white group-hover:opacity-100 cursor-pointer'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCloseTab(tab?._id)
                                    }}
                                >
                                    <X size={13} />
                                </button>

                                {active && (
                                    <motion.div
                                        className='absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-sky-400 to-violet-400'
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                    />
                                )}

                            </motion.div>

                        )
                    })}
                </AnimatePresence>
            </div>

            {!activeTab ? (
                <div className='flex min-h-0 flex-1 items-center justify-center'>
                    <div className='text-center text-zinc-500'>
                        <p className='text-sm font-medium'>Select a file to start coding</p>
                    </div>
                </div>
            ) : (
                <>
                    <div className='flex h-10 shrink-0 items-center gap-4 border-b border-white/6 px-4'>
                        <div className='flex items-center gap-2 text-zinc-400'>
                            <ActiveIcon size={14} className={`${activeColor}`} />
                            <span className='text-[13px]'>{activeTab?.name}</span>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={save}
                            disabled={saving}
                            className='flex items-center gap-2 rounded-lg cursor-pointer bg-gradient-to-b from-sky-500 to-sky-600 px-3 py-1.5 text-xs font-medium text-white shadow-[0_1px_0_rgba(255,255,255,0.2)_inset] transition-colors hover:from-sky-400 hover:to-sky-500 disabled:cursor-not-allowed disabled:opacity-40'
                        >
                            <AnimatePresence initial={false} mode='wait'>
                                {saving ? (
                                    <motion.span key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='flex items-center gap-2'>
                                        <Loader2 size={13} className='animate-spin' /> Saving
                                    </motion.span>
                                ) : justSaved ? (
                                    <motion.span key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='flex items-center gap-2'>
                                        <Check size={13} /> Saved
                                    </motion.span>
                                ) : (
                                    <motion.span key="save" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='flex items-center gap-2'>
                                        <Save size={13} /> Save
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </div>

                    <div className='min-h-0 flex-1'>
                        <MonacoEditor
                            height="100%"
                            theme="vs-dark"
                            language={activeTab?.language || "plaintext"}
                            value={code}
                            onChange={(value) => {
                                const newCode = value || "";
                                setCode(newCode);

                                setOpenTabs((tabs) => tabs.map((tab) => tab._id === activeTab._id ? { ...tab, content: newCode } : tab));

                                setActiveTab((prev) => ({ ...prev, content: newCode }));
                            }}
                            options={{
                                fontSize: 14,
                                automaticLayout: true,
                                minimap: { enabled: false },
                                wordWrap: "on",
                                scrollBeyondLastLine: false,
                                padding: { top: 12 }
                            }}
                        />
                    </div>
                </>
            )}
        </div>
    )
}

export default Editor
