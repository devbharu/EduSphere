const Pdf = require("../models/Pdf");
const fs = require("fs");
const path = require("path");

exports.uploadPdf = async (req, res) => {
    try {
        // Debug logs
        console.log("Upload attempt:");
        console.log("File:", req.file);
        console.log("Body:", req.body);

        if (!req.file) {
            return res.status(400).json({ message: "No PDF uploaded" });
        }

        const pdf = new Pdf({
            title: req.body.title || req.file.originalname.replace('.pdf', ''),
            filename: req.file.filename,
            filepath: req.file.path,
            size: req.file.size,
            uploadedBy: req.body.uploadedBy || "admin"
        });

        await pdf.save();

        console.log("PDF saved successfully:", pdf);

        res.status(201).json({
            message: "PDF uploaded successfully",
            pdf
        });

    } catch (error) {
        console.error("Upload error details:", error);

        // Delete uploaded file if database save fails
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
                console.log("Cleaned up uploaded file after error");
            } catch (unlinkError) {
                console.error("Error deleting file:", unlinkError);
            }
        }

        res.status(500).json({
            message: "Server error",
            error: error.message,
            details: error.toString()
        });
    }
};

exports.getAllPdfs = async (req, res) => {
    try {
        const pdfs = await Pdf.find().sort({ createdAt: -1 });
        console.log(`Retrieved ${pdfs.length} PDFs`);
        res.json(pdfs);
    } catch (error) {
        console.error("Get PDFs error:", error);
        res.status(500).json({
            message: "Error retrieving PDFs",
            error: error.message
        });
    }
};

exports.deletePdf = async (req, res) => {
    try {
        const pdf = await Pdf.findById(req.params.id);

        if (!pdf) {
            return res.status(404).json({ message: "PDF not found" });
        }

        // Delete the physical file
        if (pdf.filepath && fs.existsSync(pdf.filepath)) {
            fs.unlinkSync(pdf.filepath);
            console.log("Deleted file:", pdf.filepath);
        }

        // Delete from database
        await Pdf.findByIdAndDelete(req.params.id);

        console.log("PDF deleted successfully:", pdf.filename);

        res.json({ message: "PDF deleted successfully" });

    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({
            message: "Error deleting PDF",
            error: error.message
        });
    }
};