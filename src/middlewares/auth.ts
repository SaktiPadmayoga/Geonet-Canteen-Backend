import { type RequestHandler } from "express";
import { auth } from "../config/firebase";
import { UserService } from "../services/userService";
import logger from "../logger";

export const verifyFirebaseToken: RequestHandler = async (req, res, next) => {
    try {
        const hdr = req.headers.authorization;
        if (!hdr?.startsWith("Bearer ")) {
        res.status(401).json({ success: false, message: "No token provided" });
        return;
        }

        const token = hdr.split(" ")[1];
        const decoded = await auth.verifyIdToken(token);
        

        req.firebaseUser = decoded; 
        next();
    } catch (error) {
        logger.error("Firebase token verification failed", { error });
        res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

export const attachUserFromDB: RequestHandler = async (req, res, next) => {
    try {
        if (!req.firebaseUser) {
        res.status(401).json({ success: false, message: "No Firebase user found" });
        return;
        }

        const user = await UserService.getUserByFirebaseUid(req.firebaseUser.uid);
        if (!user) {
        res.status(401).json({ success: false, message: "User not found in DB" });
        return;
        }

        req.user = user;
        next();
    } catch (error) {
        logger.error("Failed attaching user from DB", { error, firebaseUid: req.firebaseUser?.uid });
        res.status(500).json({ success: false, message: "Error attaching user" });
    }
};

export const authenticate = [verifyFirebaseToken, attachUserFromDB] as const;


export const authorize = (...roles: string[]): RequestHandler => {
    return (req, res, next) => {
        if (!req.user) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
        }
        if (!roles.includes(req.user.role as string)) {
        res.status(403).json({ success: false, message: "Forbidden" });
        return;
        }
        next();
    };
};
