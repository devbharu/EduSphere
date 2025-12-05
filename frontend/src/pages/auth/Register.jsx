/**
 * Register Page - New user registration
 * Allows new students and teachers to create an account
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Mail, Lock, User, Eye, EyeOff, UserPlus, BookOpen, GraduationCap, Users } from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const { theme } = useTheme();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            const result = await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
            });

            if (result.success) {
                if (result.user.role === 'teacher') {
                    navigate('/teacher/dashboard');
                } else {
                    navigate('/dashboard');
                }
            } else {
                setError(result.message || 'Registration failed. Please try again.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${
            theme === 'dark' 
                ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
                : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
        } flex items-center justify-center px-4 py-12 relative overflow-hidden`}>
            
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-20 left-10 w-72 h-72 ${theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-200/30'} rounded-full blur-3xl animate-blob`}></div>
                <div className={`absolute top-40 right-10 w-72 h-72 ${theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-200/30'} rounded-full blur-3xl animate-blob animation-delay-2000`}></div>
                <div className={`absolute -bottom-20 left-1/2 w-72 h-72 ${theme === 'dark' ? 'bg-pink-500/10' : 'bg-pink-200/30'} rounded-full blur-3xl animate-blob animation-delay-4000`}></div>
            </div>

            {/* Theme Toggle Component */}
            <ThemeToggle />

            <div className="max-w-md w-full relative z-10">
                {/* Logo & Title */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className={`inline-flex items-center justify-center w-20 h-20 ${
                        theme === 'dark' 
                            ? 'bg-gradient-to-br from-blue-600 to-purple-600' 
                            : 'bg-gradient-to-br from-blue-600 to-indigo-600'
                    } rounded-2xl mb-4 shadow-xl transform hover:scale-105 transition-transform duration-300`}>
                        <BookOpen className="text-white" size={36} />
                    </div>
                    <h1 className={`text-4xl md:text-5xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                    } mb-2 tracking-tight`}>
                        Join EduSphere
                    </h1>
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-lg`}>
                        Create your account to start learning
                    </p>
                </div>

                {/* Register Card */}
                <div className={`${
                    theme === 'dark' 
                        ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' 
                        : 'bg-white/80 backdrop-blur-xl border-gray-200'
                } rounded-2xl shadow-2xl p-8 border transition-all duration-300 animate-slide-up`}>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Error Message */}
                        {error && (
                            <div className={`${
                                theme === 'dark' 
                                    ? 'bg-red-900/20 border-red-800 text-red-400' 
                                    : 'bg-red-50 border-red-200 text-red-700'
                            } border px-4 py-3 rounded-xl text-sm animate-shake flex items-start gap-2`}>
                                <span className="text-xl">⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Full Name Input */}
                        <div className="group">
                            <label htmlFor="name" className={`block text-sm font-semibold ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            } mb-2`}>
                                Full Name
                            </label>
                            <div className="relative">
                                <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                } transition-colors`} size={20} />
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className={`w-full pl-10 pr-4 py-3.5 ${
                                        theme === 'dark' 
                                            ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500' 
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                                    } border rounded-xl focus:outline-none focus:ring-2 ${
                                        theme === 'dark' ? 'focus:ring-blue-500/50' : 'focus:ring-blue-500/50'
                                    } transition-all duration-200`}
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="group">
                            <label htmlFor="email" className={`block text-sm font-semibold ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            } mb-2`}>
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                } transition-colors`} size={20} />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className={`w-full pl-10 pr-4 py-3.5 ${
                                        theme === 'dark' 
                                            ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500' 
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                                    } border rounded-xl focus:outline-none focus:ring-2 ${
                                        theme === 'dark' ? 'focus:ring-blue-500/50' : 'focus:ring-blue-500/50'
                                    } transition-all duration-200`}
                                    placeholder="your.email@example.com"
                                />
                            </div>
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label className={`block text-sm font-semibold ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            } mb-3`}>
                                I am a
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'student' })}
                                    className={`py-4 px-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                                        formData.role === 'student'
                                            ? theme === 'dark'
                                                ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                                                : 'border-blue-600 bg-blue-50 text-blue-700'
                                            : theme === 'dark'
                                                ? 'border-gray-600 hover:border-gray-500 text-gray-400'
                                                : 'border-gray-300 hover:border-gray-400 text-gray-700'
                                    }`}
                                >
                                    <GraduationCap size={24} />
                                    <span className="font-medium">Student</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'teacher' })}
                                    className={`py-4 px-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                                        formData.role === 'teacher'
                                            ? theme === 'dark'
                                                ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                                                : 'border-blue-600 bg-blue-50 text-blue-700'
                                            : theme === 'dark'
                                                ? 'border-gray-600 hover:border-gray-500 text-gray-400'
                                                : 'border-gray-300 hover:border-gray-400 text-gray-700'
                                    }`}
                                >
                                    <Users size={24} />
                                    <span className="font-medium">Teacher</span>
                                </button>
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="group">
                            <label htmlFor="password" className={`block text-sm font-semibold ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            } mb-2`}>
                                Password
                            </label>
                            <div className="relative">
                                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                } transition-colors`} size={20} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className={`w-full pl-10 pr-12 py-3.5 ${
                                        theme === 'dark' 
                                            ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500' 
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                                    } border rounded-xl focus:outline-none focus:ring-2 ${
                                        theme === 'dark' ? 'focus:ring-blue-500/50' : 'focus:ring-blue-500/50'
                                    } transition-all duration-200`}
                                    placeholder="Create a strong password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                                        theme === 'dark' ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'
                                    } transition-colors`}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <p className={`mt-1.5 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                Must be at least 6 characters
                            </p>
                        </div>

                        {/* Confirm Password Input */}
                        <div className="group">
                            <label htmlFor="confirmPassword" className={`block text-sm font-semibold ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            } mb-2`}>
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                } transition-colors`} size={20} />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className={`w-full pl-10 pr-12 py-3.5 ${
                                        theme === 'dark' 
                                            ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500' 
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                                    } border rounded-xl focus:outline-none focus:ring-2 ${
                                        theme === 'dark' ? 'focus:ring-blue-500/50' : 'focus:ring-blue-500/50'
                                    } transition-all duration-200`}
                                    placeholder="Re-enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                                        theme === 'dark' ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'
                                    } transition-colors`}
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Register Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex items-center justify-center gap-2 text-white py-3.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] ${
                                theme === 'dark'
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                            }`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Creating account...</span>
                                </>
                            ) : (
                                <>
                                    <UserPlus size={20} />
                                    <span>Create Account</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Already have an account?{' '}
                            <Link 
                                to="/login" 
                                className={`${
                                    theme === 'dark' 
                                        ? 'text-blue-400 hover:text-blue-300' 
                                        : 'text-blue-600 hover:text-blue-700'
                                } font-semibold transition-colors`}
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="mt-6 relative">
                        <div className={`absolute inset-0 flex items-center`}>
                            <div className={`w-full border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className={`px-4 ${
                                theme === 'dark' ? 'bg-gray-800/50 text-gray-400' : 'bg-white/80 text-gray-500'
                            }`}>
                                Quick & Secure Registration
                            </span>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="mt-6 grid grid-cols-3 gap-3">
                        <div className="text-center">
                            <div className={`text-2xl mb-1`}>🔒</div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Secure</p>
                        </div>
                        <div className="text-center">
                            <div className={`text-2xl mb-1`}>⚡</div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Fast</p>
                        </div>
                        <div className="text-center">
                            <div className={`text-2xl mb-1`}>✨</div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Simple</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className={`text-center mt-6 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                    By registering, you agree to our{' '}
                    <a href="#" className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} hover:underline`}>
                        Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} hover:underline`}>
                        Privacy Policy
                    </a>
                </p>
            </div>

            <style jsx>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.6s ease-out;
                }
                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.6s ease-out 0.2s both;
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default Register;