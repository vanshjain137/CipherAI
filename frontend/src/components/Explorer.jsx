import React from 'react'
import { motion } from 'motion/react'
import { FolderTree, RefreshCcw } from 'lucide-react'
import Folder from './Folder.jsx'

function Explorer(
  {
    projectId, tree, reloadTree, openFile
  }
) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16, width: 0 }}
      animate={{ opacity: 1, x: 0, width: 288 }}
      exit={{ opacity: 0, x: -16, width: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className='flex flex-col overflow-hidden border-r border-white/6 bg-[#111113]/90 backdrop-blur-xl'
    >

      <div className='flex h-10 w-72 shrink-0 items-center justify-between border-b border-white/6 px-3'>
        <span className='text-[11px] font-semibold tracking-wider text-zinc-500'>
          EXPLORER
        </span>

        <motion.button
          whileHover={{ rotate: 60 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.2 }}
          onClick={reloadTree}
          className='rounded-md p-1 text-zinc-400 transition-colors hover:bg-white/7 hover:text-white cursor-pointer'
          title='Refresh'
        >
          <RefreshCcw size={14} />
        </motion.button>

      </div>

      <div className='
      w-72 flex-1 overflow-y-auto px-1 py-2
      [&::-webkit-scrollbar]:w-1.5
      [&::-webkit-scrollbar-track]:bg-transparent
      [&::-webkit-scrollbar-thumb]:rounded-full
      [&::-webkit-scrollbar-thumb]:bg-white/8
      hover:[&::-webkit-scrollbar-thumb]:bg-white/15
      [&::-webkit-scrollbar-thumb]:transition-colors'
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
      >

        {tree.length == 0 ? (
          <div className='flex flex-col items-center gap-2 px-3 py-10 text-center'>

            <FolderTree size={22} className='text-zinc-700' />
            <span className='text-[12px] text-zinc-600'>Empty WorkSpace</span>

          </div>
        ) : (

          tree.map((node) => (
            <Folder
              projectId={projectId}
              node={node}
              tree={tree}
              reloadTree={reloadTree}
              openFile={openFile}
            />
          ))

        )}

      </div>

    </motion.div>
  )
}

export default Explorer