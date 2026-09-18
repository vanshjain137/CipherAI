import express from "express"
import { addCredits, deductCredits, login, logout } from "../controllers/auth.controller.js"

const router = express.Router()

router.post("/login", login)
router.get("/logout", logout)
router.post("/user/deduct-credits",deductCredits)
router.post("/user/add-credits",addCredits)

export default router