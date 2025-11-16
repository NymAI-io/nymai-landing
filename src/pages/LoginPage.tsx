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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <img 
            src="/NymAI_full_logo.svg" 
            alt="NymAI Logo" 
            className="h-12"
          />
        </div>

        {/* Login Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Welcome Back</h2>
          <p className="text-gray-600 text-center mb-6">Sign in to your NymAI account</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <LoginForm onError={setError} />
        </div>

        {/* Footer Link */}
        <div className="mt-6 text-center">
          <a 
            href="/" 
            className="text-gray-500 hover:text-gray-700 text-sm transition-colors underline"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

