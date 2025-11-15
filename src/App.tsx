
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

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

// OAuth Redirect Handler Component (handles OAuth callbacks)
const OAuthHandler: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOAuthRedirect, setIsOAuthRedirect] = useState<boolean>(false);

  // Main effect: Handle OAuth orchestration on page load
  useEffect(() => {
    // Parse URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const authProvider = urlParams.get('auth_provider');
    const devExtensionId = urlParams.get('dev_extension_id');
    
    // Check URL hash for OAuth redirect indicators (returning from Google)
    const hash = window.location.hash;
    const hasAuthHash = hash.includes('access_token') || hash.includes('code=') || hash.includes('error=');
    
    // Case 1: User is starting the OAuth flow (has auth_provider=google query param)
    if (authProvider === 'google' && devExtensionId) {
      console.log('NymAI: OAuth flow initiated, saving extension ID:', devExtensionId);
      
      // Save the extension ID to sessionStorage (persists across redirects)
      sessionStorage.setItem('nymAI_dev_extension_id', devExtensionId);
      
      // Mark as OAuth redirect so the auth logic will run
      setIsOAuthRedirect(true);
      
      // Initiate Google OAuth immediately
      // Wait for Supabase to be available, then redirect to Google
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

      waitForSupabase().then(() => {
        const supabaseLib = (window as any).supabase;
        const { createClient } = supabaseLib;
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        console.log('NymAI: Initiating Google OAuth redirect...');
        // Initiate OAuth - this will redirect to Google
        supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: 'https://www.nymai.io'
          }
        });
      }).catch((error) => {
        console.error('NymAI: Failed to load Supabase:', error);
        setAuthStatus('error');
        setErrorMessage('Failed to load authentication library. Please refresh the page.');
      });
      
      return; // Exit early - OAuth redirect will happen
    }
    
    // Case 2: User is returning from Google OAuth (has auth hash)
    if (hasAuthHash) {
      console.log('NymAI: Returning from OAuth, checking for saved extension ID...');
      setIsOAuthRedirect(true);
      return; // The existing auth logic will handle this
    }
    
    // Case 3: Normal visitor (no OAuth params, no auth hash)
    setIsOAuthRedirect(false);
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
            console.log('onAuthStateChange: SIGNED_IN event detected');
            console.log('onAuthStateChange: Extension ID:', extensionId);
            console.log('onAuthStateChange: Session:', session);
            try {
              await sendSessionToExtension(extensionId, session);
              console.log('onAuthStateChange: Session sent successfully');
              setAuthStatus('success');
              // Close the tab automatically after successful authentication
              // Small delay to ensure message is sent before closing
              setTimeout(() => {
                console.log('onAuthStateChange: Closing window...');
                window.close();
              }, 100);
            } catch (error: any) {
              console.error('onAuthStateChange: Failed to send session to extension:', error);
              console.error('onAuthStateChange: Error message:', error?.message);
              setAuthStatus('error');
              setErrorMessage(`Failed to authenticate with extension: ${error?.message || 'Please try again.'}`);
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

        // Fallback function: Check for injected extension ID (from content script)
        const checkInjectedExtensionId = () => {
          let attempts = 0;
          const maxAttempts = 10; // Try for up to 1 second (10 * 100ms)
          const checkInterval = 100; // Check every 100ms

          const checkForExtensionId = () => {
            attempts++;
            const extensionId = getExtensionId();
            
            if (extensionId) {
              // Found extension ID, verify it works by pinging the extension
              chrome.runtime.sendMessage(
                extensionId,
                { type: 'PING' },
                (response) => {
                  if (chrome.runtime.lastError) {
                    // Extension might not be installed, not responding, or ID is incorrect
                    console.warn('NymAI: Extension not found or not responding:', chrome.runtime.lastError.message);
                    if (attempts < maxAttempts) {
                      // Retry ping
                      setTimeout(checkForExtensionId, checkInterval);
                    } else {
                      resolve(null);
                    }
                  } else {
                    console.log('NymAI: Extension verified and ready:', extensionId);
                    resolve(extensionId);
                  }
                }
              );
            } else {
              // Extension ID not yet injected, retry if we haven't exceeded max attempts
              if (attempts < maxAttempts) {
                setTimeout(checkForExtensionId, checkInterval);
              } else {
                console.warn('NymAI: Extension ID not found after retries. Content script may not be loaded.');
                resolve(null);
              }
            }
          };

          // Start checking immediately
          checkForExtensionId();
        };

        // CRITICAL: First check sessionStorage for saved extension ID (from OAuth initiation)
        // This ensures we use the correct extension ID even after Google redirect
        const savedExtensionId = sessionStorage.getItem('nymAI_dev_extension_id');
        if (savedExtensionId) {
          console.log('NymAI: Using saved extension ID from sessionStorage:', savedExtensionId);
          // Verify it works by pinging the extension
          chrome.runtime.sendMessage(
            savedExtensionId,
            { type: 'PING' },
            (response) => {
              if (chrome.runtime.lastError) {
                console.warn('NymAI: Saved extension ID not responding, trying injected ID:', chrome.runtime.lastError.message);
                // Fall through to check injected ID
                checkInjectedExtensionId();
              } else {
                console.log('NymAI: Saved extension ID verified and ready:', savedExtensionId);
                resolve(savedExtensionId);
              }
            }
          );
        } else {
          // No saved ID, check for injected extension ID
          checkInjectedExtensionId();
        }
      });
    };

    const sendSessionToExtension = async (extensionId: string, session: any): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (typeof chrome === 'undefined' || !chrome.runtime) {
          reject(new Error('Chrome runtime not available'));
          return;
        }

        console.log('Attempting handshake...');
        console.log('Retrieved Extension ID from sessionStorage:', extensionId);
        console.log('Session object to be sent:', session);
        console.log('Chrome runtime available:', typeof chrome !== 'undefined' && !!chrome.runtime);
        console.log('Chrome runtime sendMessage available:', !!chrome.runtime.sendMessage);

        chrome.runtime.sendMessage(
          extensionId,
          {
            type: 'NYMAI_AUTH_SUCCESS',
            session: session
          },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error('HANDSHAKE FAILED:', chrome.runtime.lastError.message);
              console.error('Extension ID used:', extensionId);
              console.error('Full error details:', chrome.runtime.lastError);
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              console.log('Handshake successful. Extension responded:', response);
              resolve();
            }
          }
        );
      });
    };

    const handleSession = async (session: any) => {
      console.log('handleSession called with session:', session);
      setAuthStatus('processing');
      
      // Check sessionStorage first for saved extension ID
      const savedExtensionId = sessionStorage.getItem('nymAI_dev_extension_id');
      console.log('Saved extension ID from sessionStorage:', savedExtensionId);
      
      const extensionId = await checkExtensionExists();
      console.log('Extension ID from checkExtensionExists:', extensionId);
      
      if (extensionId) {
        try {
          console.log('About to send session to extension. Extension ID:', extensionId);
          await sendSessionToExtension(extensionId, session);
          console.log('Session sent successfully, setting success status');
          setAuthStatus('success');
          // Close the tab automatically after successful authentication
          setTimeout(() => {
            console.log('Closing window...');
            window.close();
          }, 100);
        } catch (error: any) {
          console.error('Failed to send session to extension:', error);
          console.error('Error message:', error?.message);
          console.error('Error stack:', error?.stack);
          setAuthStatus('error');
          setErrorMessage(`Failed to send session to extension: ${error?.message || 'Unknown error'}`);
          // Don't close on error - user needs to see the error message
        }
      } else {
        console.error('No extension ID found. Saved ID:', savedExtensionId);
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

  // Only render UI if this is an OAuth redirect
  if (!isOAuthRedirect) {
    return null;
  }

  // Show loading/authenticating state for OAuth redirects
  if (authStatus === 'processing' || authStatus === 'idle') {
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

  // Success and error states are already handled above
  return null;
};

// Main App Component with Routing
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <OAuthHandler />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

