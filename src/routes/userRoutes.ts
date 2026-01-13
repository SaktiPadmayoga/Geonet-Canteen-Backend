import express from "express";
import { authenticate, authorize } from "../middlewares/auth";
import * as userController from "../controllers/userController";

const router = express.Router();

router.get("/profile", ...authenticate, userController.getProfile);

router.get("/", ...authenticate, authorize("admin"), userController.getAllUsers);
router.post("/", ...authenticate, authorize("admin"), userController.createUser);
router.put("/:id", ...authenticate, authorize("admin"), userController.updateUser);
router.delete("/:id", ...authenticate, authorize("admin"), userController.deleteUser);

export default router;
