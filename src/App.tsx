import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import { isValidExtensionId, sanitizeExtensionId, saveExtensionIdToStorage, clearExtensionIdFromStorage, getExtensionIdFromStorage } from './utils/extensionId';
import { supabase } from './lib/supabase';

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
      // SECURITY FIX: Validate and sanitize extension ID before saving
      const sanitizedId = sanitizeExtensionId(devExtensionId);
      if (!sanitizedId || !isValidExtensionId(sanitizedId)) {
        console.error('NymAI: Invalid extension ID format:', devExtensionId);
        setAuthStatus('error');
        setErrorMessage('Invalid extension ID format. Please ensure the extension is properly installed.');
        return;
      }

      console.log('NymAI: OAuth flow initiated, saving extension ID:', sanitizedId);

      // Save the validated extension ID to sessionStorage (persists across redirects)
      saveExtensionIdToStorage(sanitizedId);

      // Mark as OAuth redirect so the auth logic will run
      setIsOAuthRedirect(true);

      console.log('NymAI: Initiating Google OAuth redirect...');
      // Initiate OAuth - this will redirect to Google
      supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://www.nymai.io'
        }
      }).catch((error) => {
        console.error('NymAI: Failed to initiate OAuth:', error);
        setAuthStatus('error');
        setErrorMessage('Failed to initiate authentication. Please refresh the page.');
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

    const setupAuthListener = () => {
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
          // SECURITY FIX: Don't log full session object (contains tokens)
          console.log('onAuthStateChange: Session received (tokens not logged for security)');
          try {
            await sendSessionToExtension(extensionId, session);
            console.log('onAuthStateChange: Session sent successfully');
            // SECURITY FIX: Clear extension ID from sessionStorage after successful use
            clearExtensionIdFromStorage();
            setAuthStatus('success');
            // Close the tab automatically after successful authentication
            // Small delay to ensure message is sent before closing
            setTimeout(() => {
              console.log('onAuthStateChange: Closing window...');
              window.close();
            }, 100);
          } catch (error: any) {
            // SECURITY FIX: Don't log full error object (might contain session data)
            console.error('onAuthStateChange: Failed to send session to extension');
            const errorMessage = error?.message || 'Please try again.';
            console.error('onAuthStateChange: Error message:', errorMessage);
            setAuthStatus('error');
            setErrorMessage(`Failed to authenticate with extension: ${errorMessage}`);
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
            // Use a simpler way to get extension ID if the function is not available
            const extensionId = (window as any).NYMAI_EXTENSION_ID || null;

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
        // SECURITY FIX: Use validated getter function
        const savedExtensionId = getExtensionIdFromStorage();
        if (savedExtensionId) {
          console.log('NymAI: Using saved extension ID from sessionStorage');
          // Verify it works by pinging the extension
          chrome.runtime.sendMessage(
            savedExtensionId,
            { type: 'PING' },
            (response) => {
              if (chrome.runtime.lastError) {
                // SECURITY FIX: Don't log full error message (might contain sensitive info)
                console.warn('NymAI: Saved extension ID not responding, trying injected ID');
                // Fall through to check injected ID
                checkInjectedExtensionId();
              } else {
                console.log('NymAI: Saved extension ID verified and ready');
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

        // SECURITY FIX: Validate extension ID before sending
        if (!isValidExtensionId(extensionId)) {
          reject(new Error('Invalid extension ID format'));
          return;
        }

        console.log('Attempting handshake...');
        console.log('Chrome runtime available:', typeof chrome !== 'undefined' && !!chrome.runtime);
        // SECURITY FIX: Don't log extension ID or session object (contains sensitive data)
        // SECURITY FIX: Don't log full session object (contains tokens)

        chrome.runtime.sendMessage(
          extensionId,
          {
            type: 'NYMAI_AUTH_SUCCESS',
            session: session
          },
          (response) => {
            if (chrome.runtime.lastError) {
              // SECURITY FIX: Only log error message, not full error object
              const errorMsg = chrome.runtime.lastError.message || 'Unknown error';
              console.error('HANDSHAKE FAILED:', errorMsg);
              reject(new Error(errorMsg));
            } else {
              console.log('Handshake successful. Extension responded');
              resolve();
            }
          }
        );
      });
    };

    const handleSession = async (session: any) => {
      // SECURITY FIX: Don't log full session object (contains tokens)
      console.log('handleSession called');
      setAuthStatus('processing');

      const extensionId = await checkExtensionExists();

      if (extensionId) {
        try {
          await sendSessionToExtension(extensionId, session);
          // SECURITY FIX: Clear extension ID from sessionStorage after successful use
          clearExtensionIdFromStorage();
          console.log('Session sent successfully, setting success status');
          setAuthStatus('success');
          // Close the tab automatically after successful authentication
          setTimeout(() => {
            console.log('Closing window...');
            window.close();
          }, 100);
        } catch (error: any) {
          // SECURITY FIX: Only log error message, not full error object
          const errorMessage = error?.message || 'Unknown error';
          console.error('Failed to send session to extension:', errorMessage);
          setAuthStatus('error');
          setErrorMessage(`Failed to send session to extension: ${errorMessage}`);
          // Don't close on error - user needs to see the error message
        }
      } else {
        console.error('No extension ID found');
        setAuthStatus('error');
        setErrorMessage('NymAI extension not found. Please ensure it is installed and enabled.');
        // Don't close on error - user needs to see the error message
      }
    };

    setupAuthListener();
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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
