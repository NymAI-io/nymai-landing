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
        <div className="text-gray-400">Loading authentication...</div>
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
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
          required
          disabled={loading}
        />

        {message && <p className="text-green-400 text-sm">{message}</p>}

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-brand-teal hover:bg-brand-tealLight text-brand-dark font-semibold rounded-lg transition-colors disabled:bg-gray-500 disabled:text-white">
            {loading ? "Loading..." : isLogin ? "Log In" : "Sign Up"}
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            disabled={loading}
            className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors disabled:bg-gray-500">
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </div>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-brand-dark text-gray-400">Or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center disabled:bg-gray-500">
        {loading ? "Loading..." : "Sign in with Google"}
      </button>
    </div>
  )
}

export default LoginForm

