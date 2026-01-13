import mongoose, { Schema, InferSchemaType } from "mongoose";

const userSchema: Schema = new Schema<IUser>(
    {
        firebaseUid: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        username: {
            type: String,
            required: true,
            trim: true,
        },
        role: {
            type: String,
            required: true,
            default: "user",
        },
    },
    {
        timestamps: true,
    }
);

export type IUser = InferSchemaType<typeof userSchema>;

export default mongoose.model<IUser>("User", userSchema);
