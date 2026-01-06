import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { UserModel } from "../models/User.js";
import { generateOTP, hashOTP } from "../utils/otp.js";

export const sendOTP = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone is required" });
    }

    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

    await UserModel.findOneAndUpdate(
      { phone },
      {
        phone,
        otpHash,
        otpExpiresAt: expiresAt,
      },
      {
        upsert: true,
        new: true,
      }
    );

    // FIXME: Just for demo purposes
    console.log(`OTP for ${phone}: ${otp}`);

    return res.json({ message: "OTP sent" });
  } catch (error) {
    console.error("sendOTP error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone and OTP are required" });
    }

    const user = await UserModel.findOne({ phone });

    if (!user || !user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (hashOTP(otp) !== user.otpHash) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otpHash = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("verifyOTP error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
