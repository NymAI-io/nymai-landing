
import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';

// Supabase configuration (same as extension)
const SUPABASE_URL = 'https://rpnprnyoylifxxstdxzg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_BB5Hs1o7Za_hR00TC23GxA__bFgMKqO';

// Extension ID - This should be set to your actual Chrome extension ID
// For development, you can find it in chrome://extensions (Developer mode)
// For production, this should be configured via environment variable or build config
const EXTENSION_ID = (window as any).NYMAI_EXTENSION_ID || null;

// Initialize Supabase client (using CDN import)
declare global {
  interface Window {
    supabase?: any;
  }
}

const App: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Wait for Supabase to be available (loaded from CDN in index.html)
    const initAuth = async () => {
      // Wait for Supabase to be available (it's loaded in index.html)
      const waitForSupabase = (): Promise<void> => {
        return new Promise((resolve, reject) => {
          if ((window as any).supabase && (window as any).supabase.createClient) {
            resolve();
            return;
          }
          
          // Wait up to 5 seconds for Supabase to load
          let attempts = 0;
          const checkInterval = setInterval(() => {
            attempts++;
            if ((window as any).supabase && (window as any).supabase.createClient) {
              clearInterval(checkInterval);
              resolve();
            } else if (attempts > 50) { // 5 seconds max
              clearInterval(checkInterval);
              reject(new Error('Supabase library failed to load'));
            }
          }, 100);
        });
      };

      try {
        await waitForSupabase();
        setupAuthListener();
      } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        setAuthStatus('error');
        setErrorMessage('Failed to load authentication library. Please refresh the page.');
      }
    };

    const setupAuthListener = () => {
      try {
        // Access Supabase from global window object (loaded via CDN)
        const supabaseLib = (window as any).supabase;
        if (!supabaseLib || !supabaseLib.createClient) {
          throw new Error('Supabase library not loaded');
        }
        const { createClient } = supabaseLib;
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        // Listen for auth state changes
        supabase.auth.onAuthStateChange(async (event: string, session: any) => {
          if (event === 'SIGNED_IN' && session) {
            setAuthStatus('processing');
            
            // Check if extension exists
            const extensionId = await checkExtensionExists();
            if (!extensionId) {
              setAuthStatus('error');
              setErrorMessage('NymAI extension not found. Please install the extension first.');
              return;
            }

            // Send session to extension
            try {
              await sendSessionToExtension(extensionId, session);
              setAuthStatus('success');
            } catch (error) {
              console.error('Failed to send session to extension:', error);
              setAuthStatus('error');
              setErrorMessage('Failed to authenticate with extension. Please try again.');
            }
          }
        });

        // Also check for existing session in URL hash
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            handleSession(session);
          }
        });
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setAuthStatus('error');
        setErrorMessage('Failed to initialize authentication.');
      }
    };

    const checkExtensionExists = (): Promise<string | null> => {
      return new Promise((resolve) => {
        // Check if chrome.runtime is available (required for external messaging)
        if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
          console.warn('NymAI: Chrome runtime API not available. Extension communication requires Chrome browser.');
          resolve(null);
          return;
        }

        // Use configured extension ID
        if (!EXTENSION_ID) {
          console.warn('NymAI extension ID not configured. Please set window.NYMAI_EXTENSION_ID');
          // For development, you can set it in browser console: window.NYMAI_EXTENSION_ID = 'your-extension-id';
          resolve(null);
          return;
        }

        // Try to ping the extension to verify it exists and is listening
        chrome.runtime.sendMessage(
          EXTENSION_ID,
          { type: 'PING' },
          (response) => {
            if (chrome.runtime.lastError) {
              // Extension might not be installed, not responding, or ID is incorrect
              console.warn('NymAI: Extension not found or not responding:', chrome.runtime.lastError.message);
              resolve(null);
            } else {
              resolve(EXTENSION_ID);
            }
          }
        );
      });
    };

    const sendSessionToExtension = async (extensionId: string, session: any): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (typeof chrome === 'undefined' || !chrome.runtime) {
          reject(new Error('Chrome runtime not available'));
          return;
        }

        chrome.runtime.sendMessage(
          extensionId,
          {
            type: 'NYMAI_AUTH_SUCCESS',
            session: session
          },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve();
            }
          }
        );
      });
    };

    const handleSession = async (session: any) => {
      setAuthStatus('processing');
      const extensionId = await checkExtensionExists();
      if (extensionId) {
        try {
          await sendSessionToExtension(extensionId, session);
          setAuthStatus('success');
        } catch (error) {
          setAuthStatus('error');
          setErrorMessage('Failed to send session to extension.');
        }
      } else {
        setAuthStatus('error');
        setErrorMessage('NymAI extension not found.');
      }
    };

    initAuth();
  }, []);

  // Show auth status UI if processing or success
  if (authStatus === 'success') {
    return (
      <div className="min-h-screen bg-brand-dark text-gray-300 font-sans flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-brand-teal/20 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Authentication Successful!</h1>
          <p className="text-lg text-gray-400">
            You are now logged in. You can close this tab and continue using the NymAI extension.
          </p>
        </div>
      </div>
    );
  }

  if (authStatus === 'error') {
    return (
      <div className="min-h-screen bg-brand-dark text-gray-300 font-sans flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Authentication Error</h1>
          <p className="text-lg text-gray-400">{errorMessage || 'An error occurred during authentication.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-dark text-gray-300 font-sans antialiased overflow-x-hidden">
       <div className="absolute top-0 left-0 w-full h-full z-0">
        <div className="absolute top-[-20rem] left-[-20rem] w-[50rem] h-[50rem] bg-brand-teal/10 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-[-20rem] right-[-20rem] w-[50rem] h-[50rem] bg-brand-teal-light/10 rounded-full filter blur-3xl opacity-50 animate-pulse animation-delay-4000"></div>
      </div>
      <div className="relative z-10">
        <Header />
        <main>
          <Hero />
          <Features />
          <HowItWorks />
          <Pricing />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;
