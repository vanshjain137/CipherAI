import { FileText, ImageIcon, KeyRound, Lock, Package, Settings2 } from "lucide-react";
import { IoLogoJavascript } from "react-icons/io5";
import { IoLogoReact } from "react-icons/io5";
import { SiTypescript } from "react-icons/si";
import { BsFiletypeJson } from "react-icons/bs";
import { FaCss } from "react-icons/fa6";
import { FaHtml5 } from "react-icons/fa";
import { AiOutlinePython } from "react-icons/ai";
import { color } from "motion";

export const getFileIcon = (name = "") => {
    const lower = name.toLowerCase();
    const ext = lower.split(".").pop()

    const KnowsName = {
        "package.json": { icon: Package, color: "text-emerald-400" },
        "package-lock.json": { icon: Lock, color: "text-zinc-500" },
        ".env": { icon: KeyRound, color: "text-lime-400" }
    }

    if (KnowsName[lower]) return KnowsName[lower];

    const map = {
        js: { icon: IoLogoJavascript, color: "text-yellow-400" },
        mjs: { icon: IoLogoJavascript, color: "text-yellow-400" },
        cjs: { icon: IoLogoJavascript, color: "text-yellow-400" },
        jsx: { icon: IoLogoReact, color: "text-sky-400" },
        ts: { icon: SiTypescript, color: "text-blue-400" },
        tsx: { icon: IoLogoReact, color: "text-blue-600" },
        json: { icon: BsFiletypeJson, color: "text-amber-400" },
        css: { icon: FaCss, color: "text-violet-400" },
        html: { icon: FaHtml5, color: "text-orange-400" },
        py: { icon: AiOutlinePython, color: "text-emerald-400" },
        yml: { icon: Settings2, color: "text-rose-400" },
        png: { icon: ImageIcon, color: "text-green-400" },
        jpg: { icon: ImageIcon, color: "text-green-400" },
        jpeg: { icon: ImageIcon, color: "text-green-400" },
        txt: { icon: FileText, color: "text-zinc-400" },
    }

    return map[ext] || { icon: FileText, color: "text-zinc-400" }
}



export const getFolderColor = (name = "") => {
    const key = name.toLowerCase();

    const map = {
        src: "text-sky-400",
        public: "text-emerald-400",
        images: "text-green-400",
        img: "text-pink-400",
        assets: "text-pink-400",
        css: "text-violet-400",
        styles: "text-violet-400",
        js: "text-yellow-400",
        scripts: "text-yellow-400",
        components: "text-sky-400",
        pages: "text-sky-400",
        utils: "text-amber-400",
        hooks: "text-teal-400",
        node_modules: "text-zinc-600",
        dist: "text-zinc-500",
        build: "text-zinc-500",
    };

    return map[key] || "text-sky-400";
}