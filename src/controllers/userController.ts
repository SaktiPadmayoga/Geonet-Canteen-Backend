import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import { auth } from "../config/firebase";

export const getProfile = (req: Request, res: Response) => {
    if (!req.user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
    }
    res.status(200).json({ success: true, user: req.user });
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await User.find();
        res.status(200).json({ success: true, data: users });
    } catch (err) {
        next(err);
        res.status(404).json({ success: false, message: "There is no User" });
        return;
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const { email, password, username, role = "user" } = req.body;

        if (!email || !password || !username) {
            return res.status(400).json({ error: "Email, password, and username are required" });
        }

        // 1. Buat user di Firebase
        const firebaseUser = await auth.createUser({
            email,
            password,
        });

        // 2. Simpan user ke MongoDB
        const user = await User.create({
            firebaseUid: firebaseUser.uid,
            email,
            username,
            role,
        });

        res.status(201).json({ success: true, user });
    } catch (error) {
        console.error("Create user error:", error);
        res.status(400).json({ error: "Failed to create user" });
    }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        res.json({ success: true, data: updated });
    } catch (err) {
        next(err);
    }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deleted = await User.findByIdAndDelete(req.params.id);
        if (!deleted) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        res.json({ success: true, message: "User deleted" });
    } catch (err) {
        next(err);
    }
};
