import { Request, Response } from "express";
import { auth } from "../config/firebase";
import { UserService } from "../services/userService";

export class AuthController {
    static async register(req: Request, res: Response): Promise<void> {
        try {
            const { idToken, username, role = "user" } = req.body;

            if (!idToken || !username) {
                res.status(400).json({ error: "idToken and username are required" });
                return;
            }

            const decoded = await auth.verifyIdToken(idToken);

            let user = await UserService.getUserByFirebaseUid(decoded.uid);

            if (!user) {
                user = await UserService.createUser({
                    firebaseUid: decoded.uid,
                    email: decoded.email ?? "",
                    username,
                    role,
                });
            }

            res.status(201).json({ success: true, user });
        } catch (error) {
            console.error("Register error:", error);
            res.status(400).json({ success: false, error: "Failed to register user" });
        }
    }
}
