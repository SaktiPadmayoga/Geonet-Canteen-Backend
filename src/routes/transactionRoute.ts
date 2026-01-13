import express from "express";
import { getAllTransactions, createTransaction } from "../controllers/transactionController";

const router = express.Router();

router.get("/", getAllTransactions);
router.post("/", createTransaction);

export default router;
