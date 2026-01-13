import { Request, Response } from "express";
import Product from "../models/Product";
import Transaction from "../models/Transaction";
import mongoose from "mongoose";

interface AuthRequest extends Request {
    user?: any;
}

export const createTransaction = async (req: AuthRequest, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { items, paymentMethod, customerName } = req.body;

        console.log("=== BACKEND RECEIVED DATA ===");
        console.log("Items:", items);
        console.log("PaymentMethod:", paymentMethod);
        console.log("CustomerName:", customerName);
        console.log("User:", req.user);
        console.log("============================");

        // Validation
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new Error("Items array is required and cannot be empty");
        }

        if (!paymentMethod) {
            throw new Error("Payment method is required");
        }

        // Check if user is authenticated (if required)
        if (!req.user || !req.user._id) {
            throw new Error("User authentication required");
        }

        const transactionId = `GP-${Date.now()}`;
        let total = 0;
        const processedItems = [];

        for (const item of items) {
            console.log("Processing item:", item);

            if (!item.product) {
                throw new Error("Product ID is required for each item");
            }

            if (!item.quantity || item.quantity <= 0) {
                throw new Error("Valid quantity is required for each item");
            }

            // Validate if product ID is a valid MongoDB ObjectId
            if (!mongoose.Types.ObjectId.isValid(item.product)) {
                throw new Error(`Invalid product ID format: ${item.product}`);
            }

            const product = await Product.findById(item.product).session(session);

            if (!product) {
                throw new Error(`Product with ID ${item.product} not found`);
            }

            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
            }

            const subtotal = product.price * item.quantity;
            total += subtotal;

            // Update product stock
            product.stock -= item.quantity;
            await product.save({ session });

            processedItems.push({
                product: product._id,
                quantity: item.quantity,
                price: product.price,
                subtotal,
            });
        }

        const transaction = new Transaction({
            transactionId,
            items: processedItems,
            total,
            paymentMethod,
            cashier: req.user._id,
            customerName: customerName || "Walk-in Customer",
        });

        await transaction.save({ session });
        await session.commitTransaction();

        await transaction.populate("items.product", "name price");
        await transaction.populate("cashier", "username");

        res.status(201).json({
            message: "Transaction completed successfully",
            transaction,
        });
    } catch (error) {
        await session.abortTransaction();

        if (error instanceof Error) {
            console.error("=== TRANSACTION ERROR ===");
            console.error("Error:", error);
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
            console.error("========================");

            return res.status(400).json({
                message: error.message || "Transaction failed",
                error:
                    process.env.NODE_ENV === "development"
                        ? {
                              stack: error.stack,
                              name: error.name,
                          }
                        : undefined,
            });
        }
    } finally {
        session.endSession();
    }
};

export const getAllTransactions = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;

        let dateFilter: any = {};
        if (startDate && endDate) {
            dateFilter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate + "T23:59:59.999Z"),
            };
        }

        const transactions = await Transaction.find(dateFilter)
            .populate("items.product", "name price category")
            .populate("cashier", "username")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Transaction.countDocuments(dateFilter);

        res.json({
            transactions,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
