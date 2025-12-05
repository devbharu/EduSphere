import React, { useState } from 'react';
import {
    Upload,
    Camera,
    Loader,
    CheckCircle,
    AlertCircle,
    Sparkles
} from 'lucide-react';
import aiService from '../../../services/aiService';

const UploadSolve = () => {
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [extractedText, setExtractedText] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setError('');

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadAndExtract = async () => {
        if (!imageFile) {
            setError('Please select an image first');
            return;
        }

        setLoading(true);
        setError('');
        setExtractedText('');
        setAiResponse('');

        try {
            // Step 1: Extract text using OCR
            const ocrResult = await aiService.uploadQuestionImage(imageFile);
            setExtractedText(ocrResult.extractedText || ocrResult.text);

            // Step 2: Get AI explanation
            const aiResult = await aiService.getAIExplanation(ocrResult.extractedText || ocrResult.text);
            setAiResponse(aiResult.explanation || aiResult.answer);

        } catch (err) {
            setError(err.message || 'Failed to process image. Please try again.');
            console.error('OCR/AI Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Upload */}
            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Your Question</h2>

                    {/* Upload Area */}
                    <div className="mb-4">
                        <label className="block w-full">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 cursor-pointer transition-colors">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="max-w-full h-64 object-contain mx-auto mb-4" />
                                ) : (
                                    <>
                                        <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                                        <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                                        <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                                    </>
                                )}
                            </div>
                        </label>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        onClick={handleUploadAndExtract}
                        disabled={!imageFile || loading}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader className="animate-spin" size={20} />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} />
                                Solve with AI
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
                {/* Extracted Text */}
                {extractedText && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle className="text-green-600" size={20} />
                            <h3 className="text-lg font-bold text-gray-900">Extracted Question</h3>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-800">{extractedText}</p>
                        </div>
                    </div>
                )}

                {/* AI Response */}
                {aiResponse && (
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-sm border border-purple-200 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="text-purple-600" size={20} />
                            <h3 className="text-lg font-bold text-gray-900">AI Explanation</h3>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                            <p className="text-gray-800 whitespace-pre-line">{aiResponse}</p>
                        </div>
                    </div>
                )}

                {!extractedText && !aiResponse && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <Camera className="mx-auto text-gray-400 mb-4" size={64} />
                        <p className="text-gray-600">Upload an image to see the results here</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadSolve;