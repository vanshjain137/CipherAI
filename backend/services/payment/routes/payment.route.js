import express from "express"
import { createOrder, verify } from "../controllers/payment.controller.js"

const router = express.Router()

router.post("/create",createOrder)
router.post("/verify",verify)


export default router