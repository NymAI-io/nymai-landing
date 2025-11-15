// src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import LoginForm from '../components/LoginForm';

const LoginPage: React.FC = () => {
  const [error, setError] = useState<string>("");

  // Save extension ID from URL query params to sessionStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const devExtensionId = urlParams.get('dev_extension_id');
    if (devExtensionId) {
      sessionStorage.setItem('nymAI_dev_extension_id', devExtensionId);
      console.log('NymAI: Saved extension ID from URL:', devExtensionId);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-teal to-brand-tealLight rounded-lg flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="6" fill="url(#gradient)"/>
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#4fd1c5"/>
                  <stop offset="100%" stopColor="#81e6d9"/>
                </linearGradient>
              </defs>
              <path d="M8 10 L8 22 M8 10 L20 22 M20 10 L20 22" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-teal to-brand-tealLight">
            NymAI
          </h1>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Welcome Back</h2>
          <p className="text-gray-400 text-center mb-6">Sign in to your NymAI account</p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-sm text-red-300">
              {error}
            </div>
          )}

          <LoginForm onError={setError} />
        </div>

        {/* Footer Link */}
        <div className="mt-6 text-center">
          <a 
            href="/" 
            className="text-gray-400 hover:text-gray-300 text-sm transition-colors underline"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

