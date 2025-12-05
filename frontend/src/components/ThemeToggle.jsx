/**
 * ThemeToggle Component - Fixed theme switcher button
 * Positioned at bottom right corner with smooth animations and tooltip
 */

import React, { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme, isDark } = useTheme();
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Tooltip */}
            {showTooltip && (
                <div
                    className={`absolute bottom-full right-0 mb-2 px-3 py-2 text-sm font-medium rounded-lg shadow-lg whitespace-nowrap transition-all duration-200 ${
                        isDark
                            ? 'bg-gray-700 text-white'
                            : 'bg-gray-900 text-white'
                    }`}
                >
                    {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    <div
                        className={`absolute top-full right-4 w-2 h-2 rotate-45 ${
                            isDark ? 'bg-gray-700' : 'bg-gray-900'
                        }`}
                    ></div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={toggleTheme}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className={`group relative p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${
                    isDark
                        ? 'bg-gradient-to-br from-gray-800 to-gray-900 text-yellow-400 hover:from-gray-700 hover:to-gray-800 border-2 border-gray-700'
                        : 'bg-gradient-to-br from-white to-gray-50 text-gray-700 hover:from-gray-50 hover:to-gray-100 border-2 border-gray-200'
                } backdrop-blur-sm hover:shadow-3xl`}
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
                {/* Animated Background Glow */}
                <div
                    className={`absolute inset-0 rounded-full blur-xl transition-opacity duration-300 ${
                        isDark
                            ? 'bg-yellow-400/20 group-hover:bg-yellow-400/30'
                            : 'bg-blue-400/20 group-hover:bg-blue-400/30'
                    }`}
                ></div>

                {/* Icon Container */}
                <div className="relative w-6 h-6">
                    {/* Sun Icon - Light Mode */}
                    <Sun
                        size={24}
                        className={`absolute inset-0 transition-all duration-500 ${
                            isDark
                                ? 'opacity-0 rotate-180 scale-0'
                                : 'opacity-100 rotate-0 scale-100'
                        }`}
                        strokeWidth={2.5}
                    />
                    {/* Moon Icon - Dark Mode */}
                    <Moon
                        size={24}
                        className={`absolute inset-0 transition-all duration-500 ${
                            isDark
                                ? 'opacity-100 rotate-0 scale-100'
                                : 'opacity-0 -rotate-180 scale-0'
                        }`}
                        strokeWidth={2.5}
                    />
                </div>

                {/* Pulse Animation Ring */}
                <span
                    className={`absolute inset-0 rounded-full transition-opacity duration-300 ${
                        isDark
                            ? 'bg-yellow-400/30'
                            : 'bg-blue-400/30'
                    } opacity-0 group-hover:opacity-100 animate-ping`}
                ></span>
            </button>

            <style jsx>{`
                @keyframes ping {
                    75%, 100% {
                        transform: scale(1.5);
                        opacity: 0;
                    }
                }
                .animate-ping {
                    animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                }
            `}</style>
        </div>
    );
};

export default ThemeToggle;