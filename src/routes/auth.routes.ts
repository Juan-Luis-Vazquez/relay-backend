import { Router } from "express";
import { sendOTP, verifyOTP } from "../controllers/auth.controller.js";

const router = Router();

router.post("/otp/send", sendOTP);
router.post("/otp/verify", verifyOTP);

export default router;
