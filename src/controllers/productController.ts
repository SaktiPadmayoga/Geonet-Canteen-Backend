import { Request, Response } from "express";
import Product from "../models/Product";
import { imageKit } from "../config/imagekit";
import mongoose from "mongoose";

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

export const getProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const { name, description, price, stock } = req.body;

        console.log("Data diterima:", req.body);
        const file = (req as any).file;

        if (!file) {
            return res.status(400).json({ message: "File gambar wajib diupload" });
        }

        // Upload ke ImageKit
        const uploadedImage = await imageKit.upload({
            file: file.buffer,
            fileName: file.originalname,
            folder: "geonet-canteen",
        });

        const product = new Product({
            name,
            description,
            price,
            stock,
            image: {
                imageUrl: uploadedImage.url,
                imageFileId: uploadedImage.fileId,
            },
        });

        await product.save();
        console.log(`Produk baru dibuat dengan ID ${product._id}`);

        res.status(201).json(product);
    } catch (error) {
        console.error("Error saat create product:", {});
        res.status(500).json({ message: "Server error", error: error });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, price, stock } = req.body;
        const file = (req as any).file;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        const updateData: any = { name, description, price, stock };

        if (file) {
            try {
                // Upload gambar baru
                const uploadedImage = await imageKit.upload({
                    file: file.buffer,
                    fileName: file.originalname,
                    folder: "geonet-canteen",
                });

                updateData.image = {
                    imageUrl: uploadedImage.url,
                    imageFileId: uploadedImage.fileId,
                };

                console.log(`Gambar baru diupload: ${uploadedImage.url}`);

                // Hapus gambar lama jika ada
                if (existingProduct.image?.imageFileId) {
                    try {
                        await imageKit.deleteFile(existingProduct.image.imageFileId);
                        console.log(`Gambar lama dengan fileId ${existingProduct.image.imageFileId} berhasil dihapus dari ImageKit`);
                    } catch (imageDeleteError) {
                        console.warn("Gagal menghapus gambar lama dari ImageKit:", imageDeleteError);
                    }
                }
            } catch (imageUploadError) {
                console.error("Gagal mengupload gambar ke ImageKit:", imageUploadError);
                return res.status(500).json({
                    message: "Gagal mengupload gambar",
                    error: imageUploadError,
                });
            }
        }

        const product = await Product.findByIdAndUpdate(id, updateData, { new: true });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        console.log(`Produk dengan ID ${id} berhasil diupdate`);
        res.json(product);
    } catch (error) {
        console.error("Error saat update product:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (product.image?.imageFileId) {
            try {
                await imageKit.deleteFile(product.image.imageFileId);
                console.log(`Gambar dengan fileId ${product.image.imageFileId} berhasil dihapus dari ImageKit`);
            } catch (imageDeleteError) {
                console.warn("Gagal menghapus gambar dari ImageKit:", imageDeleteError);
            }
        }

        await Product.findByIdAndDelete(id);
        console.log(`Produk dengan ID ${id} berhasil dihapus`);

        res.json({
            message: "Product deleted successfully",
            deletedProduct: product,
        });
    } catch (error) {
        console.error("Error saat menghapus produk:", error);
        res.status(500).json({ message: "Server error", error });
    }
};
