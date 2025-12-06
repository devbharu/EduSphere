// src/context/PdfContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiService from '../apiService';

// Utility function to format file size from bytes
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Utility function to map API response to frontend state structure
const mapApiPdfToMaterial = (pdf) => ({
    id: pdf._id,
    title: pdf.title || pdf.filename.replace(/\.pdf$/i, ''),
    type: 'pdf',
    subject: 'Backend Uploads',
    size: formatFileSize(pdf.size),
    uploadDate: pdf.createdAt ? new Date(pdf.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    description: `Uploaded by ${pdf.uploadedBy || 'Unknown'}`,
    // Backend serves files from /uploads/
    url: `/uploads/${pdf.filename}`,
    filename: pdf.filename,
    views: 0,
    downloads: 0,
    timeSpent: 0,
});

const PdfContext = createContext();

export const usePdfMaterials = () => {
    const context = useContext(PdfContext);
    if (!context) {
        throw new Error('usePdfMaterials must be used within a PdfProvider');
    }
    return context;
};

export const PdfProvider = ({ children }) => {
    const [pdfs, setPdfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initial dummy data (for non-API resources like notes)
    const initialLocalMaterials = [
        {
            id: 'local-1',
            title: 'Linear Algebra Study Guide',
            subject: 'Mathematics',
            type: 'notes',
            size: '1.8 MB',
            uploadDate: '2024-03-05',
            description: 'Quick reference guide for linear algebra',
            url: '/materials/linear-algebra.pdf',
            views: 156,
            downloads: 45,
            timeSpent: 0,
        },
    ];

    const loadPdfs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Loading PDFs from API...');
            const apiPdfs = await apiService.getAllPdfs();
            console.log('API response:', apiPdfs);

            const apiMaterials = apiPdfs.map(mapApiPdfToMaterial);
            console.log('Mapped materials:', apiMaterials);

            // Combine local and API materials
            setPdfs([...initialLocalMaterials, ...apiMaterials]);
        } catch (err) {
            console.error('Error loading PDFs:', err);
            setError(`Failed to fetch PDFs: ${err.message}`);
            // Still show local materials even if API fails
            setPdfs(initialLocalMaterials);
        } finally {
            setLoading(false);
        }
    }, []);

    const uploadNewPdf = async (file, title, uploadedBy = 'user') => {
        try {
            console.log('Uploading PDF:', { file: file.name, title, uploadedBy });

            // Validate inputs
            if (!file) {
                throw new Error('No file selected');
            }
            if (file.type !== 'application/pdf') {
                throw new Error('Only PDF files are allowed');
            }
            if (!title || title.trim() === '') {
                throw new Error('Title is required');
            }

            const uploadedPdf = await apiService.uploadPdf(file, title.trim(), uploadedBy);
            console.log('Upload successful:', uploadedPdf);

            const newMaterial = mapApiPdfToMaterial(uploadedPdf);

            // Add new PDF to the beginning of the list
            setPdfs(prev => [newMaterial, ...prev]);

            return newMaterial;
        } catch (err) {
            console.error('Upload error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Upload failed';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const removePdf = async (id) => {
        // Don't allow deletion of local materials
        if (id.startsWith('local-')) {
            throw new Error('Cannot delete local materials');
        }

        try {
            console.log('Deleting PDF:', id);
            await apiService.deletePdf(id);

            // Remove from local state
            setPdfs(prev => prev.filter(pdf => pdf.id !== id));
            console.log('PDF deleted successfully');
        } catch (err) {
            console.error('Delete error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Deletion failed';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const clearError = () => setError(null);

    useEffect(() => {
        loadPdfs();
    }, [loadPdfs]);

    const value = {
        materials: pdfs,
        loading,
        error,
        uploadNewPdf,
        removePdf,
        reloadPdfs: loadPdfs,
        clearError,
    };

    return <PdfContext.Provider value={value}>{children}</PdfContext.Provider>;
};