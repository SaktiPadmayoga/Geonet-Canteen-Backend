// src/routes/uploadRoutes.ts
import express from "express";
import multer from "multer";
import ImageKit from "imagekit";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE!,
    urlEndpoint: process.env.IMAGEKIT_ENDPOINT!,
});

router.post("/", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        const uploaded = await imagekit.upload({
            file: req.file.buffer,
            fileName: req.file.originalname,
        });

        res.json({ url: uploaded.url });
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ message: "Upload failed" });
    }
});

export default router;
