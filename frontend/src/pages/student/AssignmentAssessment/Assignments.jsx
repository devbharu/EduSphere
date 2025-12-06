import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { FileText } from 'lucide-react';

const Assignments = () => {
    const { theme } = useTheme();

    return (
        <div className={`text-center py-16 rounded-2xl border ${
            theme === 'dark'
                ? 'bg-gray-800/50 border-gray-700'
                : 'bg-white border-gray-200'
        }`}>
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
                <FileText size={40} className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
                No Assignments Yet
            </h3>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Check back later for new assignments from your instructors
            </p>
        </div>
    );
};

export default Assignments;