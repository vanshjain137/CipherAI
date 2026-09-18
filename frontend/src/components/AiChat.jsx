import { Bot, FileMinus, FilePen, FilePlus2, FolderPlus, Loader2, Send, Sparkles, User } from 'lucide-react'
import React, { useState } from 'react'
import { AnimatePresence, motion } from "motion/react"

const TOOL_META = {
    folder_created: { icon: FolderPlus, cølor: "text-sky-400", label: "Created folder" },
    file_created: { icon: FilePlus2, color: "text-emerald-400", label: "Created file" },
    file_updated: { icon: FilePen, color: "text-amber-400", label: "Updated file" },
    file_deleted: { icon: FileMinus, color: "text-red-400", label: "file deleted" },
}

const ToolBadge = ({ toolType, detail }) => {

    const meta = TOOL_META[toolType]
    if (!meta) return null;
    const Icon = meta.icon

    return (
        <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className='flex items-center justify-center'
        >

            <div className='flex items-center gap-1.5 rounded-full border border-white/8 bg-white/3 px-3 py-1 text-[11.5px] text-zinc-400'>
                <Icon size={14} className={`${meta.color}`} />
                <span>{meta.label}</span>
                {detail && <span className='text-zinc-600'>&middot; {detail}</span>}
            </div>

        </motion.div>
    )
}


function AiChat({ projectId, history = [], reloadTree }) {

    const [messages, setMessages] = useState([])
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)

    const onEvent = async (toolType, data) => {
        if (toolType == "file_created") {
            reloadTree()
            setMessages((prev) => [...prev, { role: "tool", toolType: "file_created", detail: data.file?.name }])
        }
        if (toolType == "file_updated") {
            reloadTree()
            setMessages((prev) => [...prev, { role: "tool", toolType: "file_updated", detail: data.file?.name }])
        }
        if (toolType == "file_deleted") {
            reloadTree()
            setMessages((prev) => [...prev, { role: "tool", toolType: "file_deleted", detail: data.file?.name }])
        }
        if (toolType == "folder_created") {
            reloadTree()
            setMessages((prev) => [...prev, { role: "tool", toolType: "folder_created", detail: data.folder?.name }])
        }

        if (toolType == "message") {
            reloadTree()
            const content = data?.content;
            if (!content) return;
            setMessages((prev) => {
                let copy = [...prev]
                let last = copy[copy.length - 1]
                if (last?.role == "assistant") {
                    copy[copy.length - 1] = { ...last, content }
                } else {
                    copy.push({ role: "assistant", content })
                }
                return copy
            })
            return;
        }

        if (toolType == "error") {
            throw new Error(data.message || "Ai error")
        }

    }

    const handleChat = async () => {
        setLoading(true)
        try {
            setMessages((prev)=>[...prev,{role:"user",content:message}])
            let msg = message
            setMessage("")
            history = messages
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/ai/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "text/event-stream"
                },
                credentials: 'include',
                body: JSON.stringify({
                    projectId,
                    message:msg,
                    history
                })
            })

            if (!response.ok) {
                let msg = "Ai Request Failed"
                try {
                    const data = await response.json()
                    msg = data?.message || msg
                } catch { }

                throw new Error(msg)
            }

            if (!response.body) {
                throw new Error("AI streaming is not supported.")
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ""

            try {
                while (true) {
                    const { value, done } = await reader.read()
                    if (done) {
                        break;
                    }
                    buffer += decoder.decode(value, { stream: true })
                    const events = buffer.split("\n\n")
                    buffer = events.pop() || ""

                    for (const eventText of events) {
                        if (!eventText.trim()) {
                            continue;
                        }

                        let eventType = "message"
                        let dataText = ""
                        for (const line of eventText.split("\n")) {
                            if (line.startsWith("event:")) {
                                eventType = line.slice(6).trim()
                            }
                            if (line.startsWith("data:")) {
                                dataText += line.slice(5).trim()
                            }
                        }

                        if (!dataText) {
                            continue;
                        }

                        let data;
                        try {
                            data = JSON.parse(dataText)
                        } catch (error) {
                            data = {
                                content: dataText
                            }
                        }

                        onEvent(eventType, data)

                        console.log("eventType", eventType)
                        console.log("data", data)

                    }
                }
            } finally {
                reader.releaseLock()
            }


        } catch (error) {
            console.log(error)
            return null
        }
        finally{
            setLoading(false)
        }
    }

    return (
        <div className='flex w-80 shrink-0 flex-col border border-white/6 bg-[#111113]/90 backdrop-blur-xl'>
            <div className='flex h-10 shrink-0 items-center gap-2 border-b border-white/6 px-3'>
                <span className='text-xs font-semibold tracking-wider text-zinc-300'>
                    CipherAI Chat
                </span>
            </div>

            <div className='flex-1 space-y-3 overflow-y-auto p-3'>
                {messages.length == 0 && (
                    <div className='mt-10 text-center'>
                        <div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/6 bg-white/2'>
                            <Sparkles size={22} className='text-zinc-600' />
                        </div>
                        <p className='text-sm font-medium text-zinc-400'>
                            What do you want to build?
                        </p>
                        <p className='mt-1.5 text-xs text-zinc-600'>
                            Ask me to create or modify files.
                        </p>
                    </div>
                )}

                <AnimatePresence initial={false}>
                    {messages.map((msg, i) => {
                        if (msg.role == "tool") {
                            return (
                                <ToolBadge toolType={msg.toolType} detail={msg.detail} />
                            )
                        }

                        const isUser = msg.role == "user"

                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.15 }}
                                className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : ""}`}
                            >

                                <div
                                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${isUser
                                        ? "bg-white/10 text-zinc-300"
                                        : "bg-gradient-to-br from-sky-400 to-violet-400 text-white"
                                        }`}
                                >
                                    {isUser ? <User size={12} /> : <Bot size={12} />}
                                </div>

                                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-[13px] ${isUser
                                    ? "bg-gradient-to-b from-sky-400 to-sky-600 text-white"
                                    : msg.error
                                        ? "border border-red-500/20 bg-red-500/10 text-red-300"
                                        : "border border-white/6 bg-white/3 text-zinc-300"
                                    }`}>

                                        <p className='whitespace-pre-wrap leading-relaxed'>{msg.content}</p>
                                    
                                </div>

                            </motion.div>
                        )
                    })}
                </AnimatePresence>

                {loading && (
                    <div className='flex items-center gap-2 pl-8 text-xs text-zinc-500'>
                        <Loader2 size={13} className='animate-spin'/>
                        <span>AI is Working...</span>
                    </div>
                )}

            </div>

            <div className='border-t border-white/6 p-3'>
                <div className='flex items-end gap-2 rounded-lg border border-white/8 bg-white/3 p-2 transition-colors focus-within:border-sky-400/40'>
                    <textarea
                        onChange={(e) => setMessage(e.target.value)}
                        value={message}
                        placeholder='Ask AI to build something...'
                        rows={2}
                        className='flex-1 resize-none bg-transparent text-[13px] text-zinc-200 outline-none placeholder:text-zinc-600'
                    />
                    <motion.button
                        onClick={handleChat}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={loading}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-b from-sky-500 to-sky-600 text-white shadow-[0_1px_0_rgba(255,255,255,0.2)_inset] transition-opacity cursor-pointer hover:from-sky-400 hover:to-sky-500 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {loading ? <Loader2 size={13} className='animate-spin'/> : <Send size={14} />}
                        
                    </motion.button>
                </div>
            </div>

        </div>
    )
}

export default AiChat
