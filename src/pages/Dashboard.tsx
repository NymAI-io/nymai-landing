import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        checkUser();
    }, []);

    async function checkUser() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/login');
                return;
            }

            setUser(session.user);

            // Silent Sync: Try to send session to extension if ID is available
            // This does NOT block the UI if it fails
            const extensionId = sessionStorage.getItem('nymAI_dev_extension_id');
            if (extensionId && window.chrome && window.chrome.runtime) {
                try {
                    window.chrome.runtime.sendMessage(extensionId, {
                        type: 'AUTH_SYNC',
                        session: session
                    }, (response) => {
                        if (window.chrome.runtime.lastError) {
                            // Ignore error, extension might not be listening or installed
                            console.debug('Extension sync failed (silent):', window.chrome.runtime.lastError);
                        } else {
                            console.log('Extension sync successful:', response);
                        }
                    });
                } catch (e) {
                    // Ignore any other errors
                    console.debug('Extension sync error (silent):', e);
                }
            }

        } catch (error) {
            console.error('Error checking auth:', error);
            navigate('/login');
        } finally {
            setLoading(false);
        }
    }

    async function handleSignOut() {
        await supabase.auth.signOut();
        navigate('/login');
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    <p>Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex font-sans text-zinc-100">
            {/* Sidebar */}
            <aside className="w-64 border-r border-zinc-800 bg-zinc-900/50 p-6 flex flex-col hidden md:flex">
                <div className="flex items-center gap-2 mb-8">
                    <span className="text-xl font-bold text-white tracking-tight">NymAI</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-medium border border-amber-500/20">
                        Pro
                    </span>
                </div>

                <nav className="space-y-1 flex-1">
                    <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 text-white font-medium">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Overview
                    </a>
                    <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        Settings
                    </a>
                    <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Billing
                    </a>
                </nav>

                <div className="pt-6 border-t border-zinc-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                            {user?.email?.[0].toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                            <p className="text-xs text-zinc-500 truncate">Free Plan</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors text-sm"
                    >
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
                        <p className="text-zinc-400">Manage your NymAI settings and integrations.</p>
                    </div>
                    <button onClick={handleSignOut} className="md:hidden text-zinc-400 hover:text-white">
                        Sign Out
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Stat Card */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-zinc-400">Secrets Blocked</h3>
                            <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold text-white">0</p>
                        <p className="text-xs text-zinc-500 mt-1">All time protection</p>
                    </div>

                    {/* Stat Card */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-zinc-400">Active Devices</h3>
                            <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold text-white">1</p>
                        <p className="text-xs text-zinc-500 mt-1">Current session</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
