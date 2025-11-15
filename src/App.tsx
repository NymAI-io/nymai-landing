
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
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwbnBybnlveWxpZnh4c3RkeHpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMjkwMTgsImV4cCI6MjA3NzYwNTAxOH0.nk-uMk7TZQWhlrKzwJ2AOobIHeby2FzuGEP92oRxjQc';

// Extension ID - This should be set to your actual Chrome extension ID
// For development, you can find it in chrome://extensions (Developer mode)
// For production, this should be configured via environment variable or build config
// NOTE: We check this dynamically each time, not at module load, so it can be set in console
function getExtensionId(): string | null {
  return (window as any).NYMAI_EXTENSION_ID || null;
}

// Initialize Supabase client (using CDN import)
declare global {
  interface Window {
    supabase?: any;
  }
}

const App: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOAuthRedirect, setIsOAuthRedirect] = useState<boolean>(false);

  // Check if this is an OAuth redirect (has hash with auth tokens) vs a direct visit
  useEffect(() => {
    // Check URL hash for OAuth redirect indicators
    const hash = window.location.hash;
    const hasAuthHash = hash.includes('access_token') || hash.includes('code=') || hash.includes('error=');
    setIsOAuthRedirect(hasAuthHash);
  }, []);

  useEffect(() => {
    // Only run auth logic if this is an OAuth redirect
    if (!isOAuthRedirect) {
      return;
    }
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
              // Close the tab automatically after successful authentication
              // Small delay to ensure message is sent before closing
              setTimeout(() => {
                window.close();
              }, 100);
            } catch (error) {
              console.error('Failed to send session to extension:', error);
              setAuthStatus('error');
              setErrorMessage('Failed to authenticate with extension. Please try again.');
              // Don't close on error - user needs to see the error message
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

        // Use configured extension ID (check dynamically each time)
        const extensionId = getExtensionId();
        if (!extensionId) {
          console.warn('NymAI extension ID not configured. Please set window.NYMAI_EXTENSION_ID');
          // For development, you can set it in browser console: window.NYMAI_EXTENSION_ID = 'your-extension-id';
          resolve(null);
          return;
        }

        // Try to ping the extension to verify it exists and is listening
        chrome.runtime.sendMessage(
          extensionId,
          { type: 'PING' },
          (response) => {
            if (chrome.runtime.lastError) {
              // Extension might not be installed, not responding, or ID is incorrect
              console.warn('NymAI: Extension not found or not responding:', chrome.runtime.lastError.message);
              resolve(null);
            } else {
              resolve(extensionId);
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
          // Close the tab automatically after successful authentication
          setTimeout(() => {
            window.close();
          }, 100);
        } catch (error) {
          setAuthStatus('error');
          setErrorMessage('Failed to send session to extension.');
          // Don't close on error - user needs to see the error message
        }
      } else {
        setAuthStatus('error');
        setErrorMessage('NymAI extension not found. Please ensure it is installed and enabled.');
        // Don't close on error - user needs to see the error message
      }
    };

    initAuth();
  }, [isOAuthRedirect]);

  // Show minimal success UI (tab will close automatically)
  if (authStatus === 'success') {
    return (
      <div className="min-h-screen bg-brand-dark text-gray-300 font-sans flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-brand-teal/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <svg className="w-8 h-8 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Authentication Successful!</h1>
          <p className="text-lg text-gray-400">
            Closing this window...
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
          <div className="pt-4 space-y-2 text-sm text-gray-500">
            <p>Please ensure:</p>
            <ul className="list-disc list-inside space-y-1 text-left">
              <li>The NymAI extension is installed</li>
              <li>The extension is enabled in chrome://extensions</li>
              <li>You have refreshed the extension after installation</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // If this is an OAuth redirect, show headless auth UI
  if (isOAuthRedirect) {
    // Default loading/authenticating state for OAuth redirects
    return (
      <div className="min-h-screen bg-brand-dark text-gray-300 font-sans flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-brand-teal/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <svg className="w-8 h-8 text-brand-teal animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Authenticating...</h1>
          <p className="text-lg text-gray-400">
            Please wait while we complete your authentication.
          </p>
        </div>
      </div>
    );
  }

  // If this is a direct visit, show the full landing page
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

