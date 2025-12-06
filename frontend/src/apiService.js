// src/apiService.js
import axios from 'axios';

// IMPORTANT: Ensure this matches your running Express port (e.g., 5000 or 8000)
const API_BASE_URL = 'http://localhost:5000/api/pdfs';

/**
 * Service for managing PDF materials via the backend API.
 */
const apiService = {

    /**
     * Fetches all PDF records from the backend.
     */
    getAllPdfs: async () => {
        try {
            console.log('Fetching all PDFs from:', API_BASE_URL);
            const response = await axios.get(API_BASE_URL);
            console.log('Received PDFs:', response.data);
            return response.data;
        } catch (error) {
            console.error("API Error: Error retrieving all PDFs", error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Uploads a new PDF file and its metadata.
     * The file field name 'pdf' matches the Multer config: upload.single("pdf")
     */
    uploadPdf: async (file, title, uploadedBy = 'User Upload') => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('pdf', file); // ✅ FIXED: Changed from 'pdfFile' to 'pdf'
        formData.append('uploadedBy', uploadedBy);

        try {
            console.log('Uploading PDF:', {
                filename: file.name,
                size: file.size,
                type: file.type,
                title: title,
                uploadedBy: uploadedBy
            });

            const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Upload response:', response.data);
            return response.data.pdf;
        } catch (error) {
            console.error("API Error: Error uploading PDF", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw error;
        }
    },

    /**
     * Deletes a PDF record and its file from the server.
     */
    deletePdf: async (id) => {
        try {
            console.log('Deleting PDF with ID:', id);
            const response = await axios.delete(`${API_BASE_URL}/${id}`);
            console.log('Delete response:', response.data);
            return response.data;
        } catch (error) {
            console.error(`API Error: Error deleting PDF with ID ${id}`, {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw error;
        }
    }
};

export default apiService;