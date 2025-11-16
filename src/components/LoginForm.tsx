// src/components/LoginForm.tsx
import React, { useState, useEffect } from "react"

// Supabase configuration (same as App.tsx)
const SUPABASE_URL = 'https://rpnprnyoylifxxstdxzg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwbnBybnlveWxpZnh4c3RkeHpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMjkwMTgsImV4cCI6MjA3NzYwNTAxOH0.nk-uMk7TZQWhlrKzwJ2AOobIHeby2FzuGEP92oRxjQc';

interface LoginFormProps {
  onError: (error: string) => void
}

function LoginForm({ onError }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLogin, setIsLogin] = useState(true) // Toggle between login and signup
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [supabase, setSupabase] = useState<any>(null)

  // Initialize Supabase client when component mounts
  useEffect(() => {
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
      const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      setSupabase(client);
    }).catch((error) => {
      console.error('Failed to load Supabase:', error);
      onError('Failed to load authentication library. Please refresh the page.');
    });
  }, [onError]);

  // Function to send session to extension and close tab (headless flow)
  const sendSessionToExtensionAndClose = async (session: any) => {
    // Get extension ID from sessionStorage (saved during OAuth initiation) or from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const devExtensionId = urlParams.get('dev_extension_id') || sessionStorage.getItem('nymAI_dev_extension_id');
    
    if (!devExtensionId) {
      console.warn('NymAI: No extension ID found. User may not have extension installed.');
      // Don't close tab if no extension - user might want to use the web version
      return;
    }

    // Check if chrome.runtime is available
    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
      console.warn('NymAI: Chrome runtime not available. This page should be opened from the extension.');
      return;
    }

    console.log('NymAI: Sending session to extension:', devExtensionId);
    
    try {
      chrome.runtime.sendMessage(
        devExtensionId,
        {
          type: 'NYMAI_AUTH_SUCCESS',
          session: session
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('NymAI: Failed to send session to extension:', chrome.runtime.lastError.message);
            onError(`Failed to authenticate with extension: ${chrome.runtime.lastError.message}`);
          } else {
            console.log('NymAI: Session sent successfully to extension');
            // Close the tab after successful authentication
            setTimeout(() => {
              window.close();
            }, 100);
          }
        }
      );
    } catch (error: any) {
      console.error('NymAI: Error sending session to extension:', error);
      onError(`Failed to authenticate with extension: ${error.message || 'Unknown error'}`);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    onError("") // Clear previous errors
    setMessage(null)
    setLoading(true)

    if (!supabase) {
      onError('Authentication library not loaded. Please refresh the page.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) {
          onError(error.message || "Unable to log in with those credentials.")
        } else if (data.session) {
          // Successfully logged in - send session to extension and close tab
          await sendSessionToExtensionAndClose(data.session)
        }
      } else {
        // Signup
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        })
        if (error) {
          onError(error.message || "We could not create your account. Please try again.")
        } else if (data.session) {
          // Auto-confirm is on, user is logged in
          await sendSessionToExtensionAndClose(data.session)
        } else if (data.user) {
          // Auto-confirm is off, email confirmation needed
          setMessage("Please check your email to confirm your sign up.")
        }
      }
    } catch (err: any) {
      onError(err.message || "An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  // Handler function for Google Sign-In button
  // This redirects to the main page with OAuth query parameters
  const handleGoogleSignIn = async () => {
    onError("") // Clear previous errors
    setMessage(null)
    setLoading(true)

    try {
      // Get extension ID from URL params or sessionStorage
      const urlParams = new URLSearchParams(window.location.search);
      const devExtensionId = urlParams.get('dev_extension_id') || sessionStorage.getItem('nymAI_dev_extension_id');
      
      if (devExtensionId) {
        // Save extension ID to sessionStorage for the OAuth redirect
        sessionStorage.setItem('nymAI_dev_extension_id', devExtensionId);
      }

      // Redirect to main page with OAuth parameters (same as extension does)
      const url = `https://www.nymai.io?auth_provider=google&dev_extension_id=${devExtensionId || ''}`;
      window.location.href = url;
    } catch (err: any) {
      console.error('NymAI: Error initiating Google OAuth:', err)
      onError(`Login failed: ${err.message || 'Unknown error occurred'}`)
      setLoading(false)
    }
  }

  if (!supabase) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-600">Loading authentication...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleEmailAuth} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent"
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent"
          required
          disabled={loading}
        />

        {message && <p className="text-green-600 text-sm">{message}</p>}

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 bg-brand-teal hover:bg-brand-teal/90 text-brand-dark font-semibold rounded-lg transition-colors shadow-lg disabled:bg-gray-300 disabled:text-gray-500">
            {loading ? "Loading..." : isLogin ? "Log In" : "Sign Up"}
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            disabled={loading}
            className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-lg transition-colors disabled:bg-gray-100 disabled:text-gray-400">
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </div>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full py-2.5 bg-white border border-[#747775] text-[#1F1F1F] font-medium rounded-lg transition-colors flex items-center justify-center gap-3 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 hover:bg-gray-50"
        style={{ fontFamily: 'Roboto, sans-serif', fontSize: '14px', lineHeight: '20px' }}>
        {loading ? (
          "Loading..."
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <g fill="none" fillRule="evenodd">
                <path d="M17.64 9.2045c0-.6371-.0573-1.2516-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7955 2.7164v2.2581h2.9087c1.7023-1.5668 2.6837-3.874 2.6837-6.6149z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.5831-5.0318-3.7104H.957v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
                <path d="M3.9682 10.71c-.18-.54-.2822-1.1173-.2822-1.71s.1023-1.17.2822-1.71V4.9582H.957C.3477 6.1732 0 7.5477 0 9c0 1.4523.3477 2.8268.957 4.0418l3.0112-2.3318z" fill="#FBBC05"/>
                <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.4261 0 9 0 5.4818 0 2.4382 2.0168.957 4.9582L3.9682 7.29C4.6718 5.1627 6.656 3.5795 9 3.5795z" fill="#EA4335"/>
              </g>
            </svg>
            Sign in with Google
          </>
        )}
      </button>
    </div>
  )
}

export default LoginForm

