import { app } from "../config/firebase.js"
import { getAuth } from "firebase-admin/auth"
import User from "../models/user.model.js"
import crypto from "crypto"
import redis from "../../../shared/redis/redis.js"

export const login = async (req, res) => {
    try {
        const { token } = req.body
        const decoded = await getAuth(app).verifyIdToken(token)

        let user = await User.findOne({
            firebaseUid: decoded.uid
        })

        if (!user) {
            user = await User.create({
                firebaseUid: decoded.uid,
                name: decoded.name,
                email: decoded.email,
                avatar: decoded.picture
            })
        }

        const sessionId = crypto.randomUUID()
        await redis.set(`user-session-${user?._id}`, sessionId, "EX", 7 * 24 * 60 * 60)

        await redis.set(`session-${sessionId}`, JSON.stringify({
            name: user.name,
            _id: user._id,
            email: user.email,
            avatar: user.avatar,
            credits: user.credits
        }), "EX", 7 * 24 * 60 * 60)

        res.cookie("session", sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV==="production",
            sameSite: process.env.NODE_ENV==="production"?"none":"strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({ message: `login error ${error}` })
    }
}

export const logout = async (req, res) => {
    try {
        const sessionId = req.cookies?.session
        await redis.del(`session-${sessionId}`)
        res.clearCookie("session")

        return res.status(200).json({ message: "Logout successfully" })

    } catch (error) {
        return res.status(500).json({ message: `logout error ${error}` })
    }
}


export const deductCredits = async (req, res) => {
    try {
        const { userId, amount } = req.body
        if (!userId) {
            return res.status(401).json({ message: "userId not found" })
        }
        const user = await User.findOneAndUpdate(
            { _id: userId, credits: { $gte: amount } },
            {
                $inc: {
                    credits: -amount
                }
            }, { returnDocument: "after" }).select("credits")

        if (!user) {
            return res.status(401).json({ message: "insufficient credits" })
        }
        const sessionId = await redis.get(`user-session-${userId}`)

        await redis.set(`session-${sessionId}`, JSON.stringify({
            name: user.name,
            _id: user._id,
            email: user.email,
            avatar: user.avatar,
            credits: user.credits
        }), "EX", 7 * 24 * 60 * 60)

        return res.status(200).json({ credits: user.credits })

    } catch (error) {
        return res.status(500).json({ message: `deduct credits error: ${error}` })
    }
}


export const addCredits = async (req, res) => {
    try {
        const { userId, credits } = req.body
        if (!userId) {
            return res.status(401).json({ message: "userId not found" })
        }

        const user = await User.findById(userId)

        if (!user) {
            return res.status(401).json({ message: "user not found" })
        }

        user.credits = (user.credits || 0) + Number(credits)
        await user.save()

        const sessionId = await redis.get(`user-session-${userId}`)

        await redis.set(`session-${sessionId}`, JSON.stringify({
            name: user.name,
            _id: user._id,
            email: user.email,
            avatar: user.avatar,
            credits: user.credits
        }), "EX", 7 * 24 * 60 * 60)

        return res.status(200).json(user.credits)

    } catch (error) {
        return res.status(500).json({ message: `add credits error: ${error}` })
    }
}