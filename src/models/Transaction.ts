import mongoose, { InferSchemaType, Schema } from "mongoose";

const transactionItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    subtotal: {
        type: Number,
        required: true,
        min: 0,
    },
});

const transactionSchema: Schema = new Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true,
    },
    items: [transactionItemSchema],
    total: {
        type: Number,
        required: true,
        min: 0,
    },
    paymentMethod: {
        type: String,
        enum: ["cash", "card", "digital"],
        required: true,
    },
    cashier: {
        type: Schema.Types.ObjectId,
        ref: "User",
        // required: true
    },
    customerName: {
        type: String,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export type ITransaction = InferSchemaType<typeof transactionSchema>;

export default mongoose.model<ITransaction>("Transaction", transactionSchema);
