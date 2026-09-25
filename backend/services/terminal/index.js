import express from "express"
import dotenv from "dotenv"
import { connectDb } from "./config/db.js"
import http from "http"
import { Server } from "socket.io"
import os from "os"
import path from "path"
import fs from "fs/promises"
import pty from "node-pty"

dotenv.config()

const port = 8005

const app = express()
app.use(express.json())

const fileServiceUrl = process.env.FILE_SERVICE_URL || "http://localhost:8003"

const isDev = process.env.NODE_ENV !== "production";

const WORKSPACE_ROOT = isDev
    ? path.join(process.cwd(), "temp_workspace")
    : path.join(os.tmpdir(), "cipher-ai");



const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: true,
        credentials: true
    }
})

const sessions = new Map()

const send = (socket, data) => {
    if (!socket.connected) {
        return;
    }
    socket.emit("terminal:data", String(data || ""))
}

const safeName = (name) => {
    if (!name || name === "." || name === ".." || name.includes("/") || name.includes("\\")) {
        throw new Error(`Invalid file/folder name: ${name}`)
    }
    return name;
}

const workspace = (projectId) => {
    return path.join(WORKSPACE_ROOT, String(projectId))
}

const normaliseCols = (cols) => {
    const value = Number(cols)
    if (!Number.isFinite(value)) {
        return 80
    }
    return Math.max(20, Math.min(Math.floor(value), 500))
}

const normaliseRows = (rows) => {
    const value = Number(rows)
    if (!Number.isFinite(value)) {
        return 30
    }
    return Math.max(5, Math.min(Math.floor(value), 200))
}

const getTree = async (
    projectId, userId
) => {
    const url = `${fileServiceUrl}/tree/${projectId}`

    const response = await fetch(url, {
        headers: {
            "x-user-id": String(userId)
        }
    })

    const text = await response.text()
    let data = {}

    try {
        data = text ? JSON.parse(text) : {}
    } catch (error) {
        data = { message: text }
    }

    if (!response.ok) {
        throw new Error(
            data?.message || `File service returned ${response.status}`
        );
    }

    return Array.isArray(data) ? data : []
}

const writeNodes = async (nodes, directory) => {
    if (!Array.isArray(nodes)) return;

    for (const node of nodes) {
        const name = safeName(node.name)
        const target = path.join(directory, name)
        if (node.type === "folder") {
            await fs.mkdir(target, { recursive: true })
            await writeNodes(node.children || [], target)
            continue;
        }
        if (node.type === "file") {
            await fs.mkdir(path.dirname(target), { recursive: true })
            await fs.writeFile(target, node.content || "", "utf8")
        }
    }
}

const syncProject = async (projectId, userId) => {
    const tree = await getTree(projectId, userId)

    const root = workspace(projectId)
    await fs.mkdir(root, { recursive: true })

    if (tree.length == 1 && tree[0]?.type == "folder") {
        await writeNodes(tree[0].children || [], root)
    } else {
        await writeNodes(tree, root)
    }

    return {
        tree,
        root
    }
}

io.on("connection", (socket) => {
    console.log("Terminal Connected", socket?.id)

    socket.on("terminal:init", async ({ projectId, userId, cols = 80, rows = 30 }) => {
        try {
            projectId = String(projectId)
            userId = String(userId)

            if (!projectId || !userId) {
                throw new Error("Project ID and User ID are required");
            }

            const existingSession = sessions.get(socket.id)

            if (existingSession) {
                try {
                    existingSession.ptyProcess.kill()
                } catch (error) { }
                sessions.delete(socket.id)
            }

            cols = normaliseCols(cols)
            rows = normaliseRows(rows)

            const { root } = await syncProject(projectId, userId)

            const minimalEnv = process.platform === "win32" ? { 
                ...process.env,
                NODE_OPTIONS: "--max-old-space-size=120",
                npm_config_audit: "false",
                npm_config_fund: "false",
                npm_config_progress: "false",
                npm_config_maxsockets: "2"
            } : {
                PATH: process.env.PATH || "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin",
                HOME: process.env.HOME || "/",
                USER: process.env.USER || "user",
                FORCE_COLOR: "1",
                TERM: "xterm-256color",
                NODE_OPTIONS: "--max-old-space-size=120",
                npm_config_audit: "false",
                npm_config_fund: "false",
                npm_config_progress: "false",
                npm_config_maxsockets: "2"
            };

            const safeShell = process.platform === "win32" ? "powershell.exe" : "/bin/bash";

            const ptyProcess = pty.spawn(
                safeShell,
                [],
                {
                    name: "xterm-256color",
                    cols,
                    rows,
                    cwd: process.cwd(),
                    env: minimalEnv
                }
            )
            if (process.platform !== "win32") {
                ptyProcess.write(`cd "${root}"\r`);
                ptyProcess.write(`alias npm="npx --yes pnpm --network-concurrency 1 --child-concurrency 1"\r`);
                ptyProcess.write(`clear\r`);
            }

            let outputBuffer = "";
            let debounceTimeout = null;

            ptyProcess.onData((data) => {
                outputBuffer += data;

                if (!debounceTimeout) {
                    debounceTimeout = setTimeout(() => {
                        const chunk = outputBuffer.slice(0, 50000); 
                        
                        send(socket, chunk);
                        
                        outputBuffer = outputBuffer.slice(50000);
                        debounceTimeout = null;
                    }, 15);
                }
            })

            ptyProcess.onExit(({ exitCode }) => {
                send(socket, `\r\n\x1b[90m[shell exited: ${exitCode}]\x1b[0m\r\n`)
                const session = sessions.get(socket.id)
                if (session?.ptyProcess == ptyProcess) {
                    sessions.delete(socket.id)
                }
            })

            sessions.set(socket.id, {
                projectId,
                userId,
                cwd: root,
                ptyProcess
            })

            socket.emit("terminal:ready", { cols, rows })

        } catch (error) {
            console.log("terminal:init error", error)
            send(socket, `\r\n\x1b[31m${error.message}\x1b[0m\r\n`)
        }
    })

    socket.on("terminal:write", (data) => {
        const session = sessions.get(socket.id)
        if (!session) return;
        session.ptyProcess.write(String(data))
    })

    socket.on("terminal:resize", ({ cols, rows }) => {
        const session = sessions.get(socket.id)
        if (!session) return;
        cols = Number(cols)
        rows = Number(rows)

        if (!Number.isFinite(cols) || !Number.isFinite(rows)) return;
        cols = normaliseCols(cols)
        rows = normaliseRows(rows)
        session.ptyProcess.resize(cols, rows);
    })

    socket.on("terminal:sync", async () => {
        try {
            const session = sessions.get(socket.id);
            if (!session) return;

            console.log(`[Terminal] Syncing project files for ${session.projectId}...`);
            await syncProject(session.projectId, session.userId);
            console.log(`[Terminal] Sync complete!`);
        } catch (error) {
            console.error("[Terminal] Sync failed:", error.message);
        }
    })

    socket.on("disconnect", () => {
        console.log("terminal disconnected")
        const session = sessions.get(socket.id)
        if (session) {
            try {
                session.ptyProcess.kill()
            } catch { }
            sessions.delete(socket.id)
        }
    })

})


app.get("/health", (req, res) => {
    return res.json({
        success: true,
        service: "terminal"
    })
})




server.listen(port, () => {
    connectDb()
    console.log(`terminal service started at ${port}`)
})