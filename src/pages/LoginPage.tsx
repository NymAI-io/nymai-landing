// src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';

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
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Log In</h1>
        <p className="text-zinc-400">Auth integration coming soon...</p>
      </div>
    </div>
  );
};

export default LoginPage;
