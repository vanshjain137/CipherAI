import { AIMessage, HumanMessage } from "@langchain/core/messages"
import { graph } from "../graph/graph.js"
import { deductCredits } from "../utils/deductCredits.js"

const buildHistory = (history) => {
    if(!Array.isArray(history)){
        return []
    }
    const recents = history.slice(-6)
    return recents.filter((recent)=>recent?.content && (recent.role=="user" || recent.role=="assistant"))
    .map((msg)=>{
        if(msg.role=="user"){
            return new HumanMessage(msg.content)
        }
        return new AIMessage(msg.content)
    })
}

const sendEvent = (res,type,data)=>{
    if(res.writableEnded || res.destroyed){
        return false
    }

    try {
        res.write(`event:${type}\n`)
        res.write(`data:${JSON.stringify(data || {})}\n\n`)
        return true
    } catch (error) {
        console.error(`SSE error: ${error}`)
        return false
    }
}

export const chat = async (req,res) => {
    
    let disconnected = false
    try {
        
        const {projectId, message, history=[]} = req.body
        const userId = req.headers["x-user-id"]
        

        if(!projectId){
            return res.status(400).json({
                message:"project id not found"
            })
        }

        if(!message){
            return res.status(400).json({
                message:"message not found"
            })
        }

        res.setHeader(
            "Content-Type",
            "text/event-stream; charset=utf-8"
        );

        res.setHeader(
            "Cache-Control",
            "no-cache, no-transform"
        );

        res.setHeader(
            "Connection",
            "keep-alive"
        );

        res.setHeader(
            "X-Accel-Buffering",
            "no"
        );

        res.flushHeaders?.()

        res.once("close",()=>{
            disconnected=true
            console.log("AI CLIENT DISCONNECTED")
        })

        sendEvent(res,"start",{
            success:true,
            message:"AI Started"
        })

        const graphData = graph({projectId,userId})
        const messages = buildHistory(history)
        messages.push(
            new HumanMessage(message.trim())
        )

        const stream = await graphData.stream(
            {
                messages
            },
            {
                streamMode:"updates",
                recursionLimit:40
            }
        )

        await deductCredits({userId,amount:10})

        let finalMessage=""

        for await (const chunk of stream) {

            if(disconnected || res.writableEnded)break;

            if(chunk?.agent){
                const agentMessages = chunk.agent?.messages
                const last = agentMessages[agentMessages.length-1]
                if(!last){
                    continue;
                }

                if(Array.isArray(last.tool_calls) && last.tool_calls?.length){
                    for (const call of last.tool_calls) {
                        sendEvent(res,"tool_start",{
                            tool:call.name,
                            args:call.args || {}
                        })
                    }
                    continue;
                }

                let content = ""
                if(typeof last.content == "string"){
                    content= last.content
                }else if(Array.isArray(last.content)){
                    content= last.content
                                .filter((item)=>item.type=="text")
                                .map((item)=>item.text).join("")
                }

                if(content){
                    finalMessage = content
                    sendEvent(res,"message",{content})
                }

            }

            if(chunk?.tools){
                const toolMessages = chunk.tools?.messages || []
                for (const toolMessage of toolMessages) {
                    let result=toolMessage.content
                    try {
                        result=typeof result=="string" ? JSON.parse(result) : result
                    } catch (error) {
                        continue;
                    }

                    if(result?.operation){
                        sendEvent(res,result.operation,result)
                    }

                }
            }
        }

        if(!disconnected && !res.writableEnded){
            sendEvent(res,"done",{
                success:true,
                message:finalMessage || "done"
            })
            res.end()
        }

    } catch (error) {
        console.log("AI STRAM ERROR:",error)
        if(disconnected){
            return;
        }
        if(res.headersSent){
            sendEvent(res,"error",{
                success: false,
                message:
                    error?.message || "AI request failed."
            })

            if(!res.writableEnded){
                res.end()
            }
            return;
        }

        return res.status(500).json({
            success: false,
            message:
                error?.message ||
                "AI request failed.",
        });

    }
}