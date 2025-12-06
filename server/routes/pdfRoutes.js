// routes/pdfRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const pdfController = require("../controllers/pdfController");

// --- Multer Configuration ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now();
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
        cb(null, true);
    } else {
        cb(new Error("Only PDF files allowed"), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// --- Routes ---

// CHANGE: Use "pdf" instead of "pdfFile" to match standard form field name
router.post("/upload", upload.single("pdf"), pdfController.uploadPdf);

// GET ALL PDFs
router.get("/", pdfController.getAllPdfs);

// DELETE PDF
router.delete("/:id", pdfController.deletePdf);

module.exports = router;