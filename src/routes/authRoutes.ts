import { AuthController } from "../controllers/authController";
import { Router } from "express";

const router = Router();

router.post("/register", AuthController.register);

export default router;
