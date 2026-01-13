import mongoose, { InferSchemaType, Schema } from "mongoose";

interface ProductImage {
    imageUrl: string;
    imageFileId?: string;
}

export interface ProductDocument extends Document {
    name: string;
    description: string;
    price: number;
    stock: number;
    image: ProductImage;
}

const productSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },

    image: {
        imageUrl: {
            type: String || null,
            default: "https://ik.imagekit.io/sakti/geonet-canteen/placeholder-image.jpg?updatedAt=1756950446739",
            required: false,
        },
        imageFileId: {
            type: String,
        },
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

productSchema.pre<IProduct>("save", function (next) {
    this.updatedAt = new Date();
    next();
});

export type IProduct = InferSchemaType<typeof productSchema>;

export default mongoose.model<ProductDocument>("Product", productSchema);
