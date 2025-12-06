import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Helper for class names
function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

// Placeholder Price IDs - Replace with actual Stripe Price IDs
const PRICE_PRO = 'price_1Qf...'; // e.g. price_1234
const PRICE_TEAM = 'price_1Qg...'; // e.g. price_5678

export default function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [subscription, setSubscription] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'billing'>('overview');
    const [processing, setProcessing] = useState(false);

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

            // Fetch Profile & Subscription
            const [profileRes, subRes] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', session.user.id).single(),
                supabase.from('subscriptions').select('*').eq('user_id', session.user.id).single()
            ]);

            if (profileRes.data) setProfile(profileRes.data);
            if (subRes.data) setSubscription(subRes.data);

            // Silent Sync
            const extensionId = sessionStorage.getItem('nymAI_dev_extension_id');
            if (extensionId && window.chrome && window.chrome.runtime) {
                try {
                    window.chrome.runtime.sendMessage(extensionId, {
                        type: 'AUTH_SYNC',
                        session: session
                    }, (response) => {
                        if (window.chrome.runtime.lastError) console.debug('Sync failed:', window.chrome.runtime.lastError);
                    });
                } catch (e) { console.debug('Sync error:', e); }
            }

        } catch (error) {
            console.error('Error checking auth:', error);
            navigate('/login');
        } finally {
            setLoading(false);
        }
    }

    async function handleCHECKOUT(priceId: string) {
        if (!user) return;
        setProcessing(true);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    priceId,
                    userId: user.id,
                    email: user.email,
                }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error('Checkout failed:', data);
                alert('Failed to start checkout.');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('An error occurred.');
        } finally {
            setProcessing(false);
        }
    }

    async function handlePortal() {
        if (!profile?.billing_customer_id) return;
        setProcessing(true);
        try {
            const res = await fetch('/api/portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: profile.billing_customer_id,
                }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error('Portal failed:', data);
                alert('Failed to open billing portal.');
            }
        } catch (error) {
            console.error('Portal error:', error);
            alert('An error occurred.');
        } finally {
            setProcessing(false);
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

    // Determine plan name
    const planName = subscription?.status === 'active' || subscription?.status === 'trialing'
        ? 'Pro' // Simplified logic: if stored price_id matches team, display Team
        : 'Free';

    return (
        <div className="min-h-screen bg-zinc-950 flex font-sans text-zinc-100">
            {/* Sidebar */}
            <aside className="w-64 border-r border-zinc-800 bg-zinc-900/50 p-6 flex flex-col hidden md:flex">
                <div className="flex items-center gap-2 mb-8">
                    <span className="text-xl font-bold text-white tracking-tight">NymAI</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${planName === 'Pro' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-zinc-700 text-zinc-300 border-zinc-600'}`}>
                        {planName} User
                    </span>
                </div>

                <nav className="space-y-1 flex-1">
                    <button onClick={() => setActiveTab('overview')} className={classNames("w-full flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors", activeTab === 'overview' ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50")}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Overview
                    </button>
                    <button onClick={() => setActiveTab('billing')} className={classNames("w-full flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors", activeTab === 'billing' ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50")}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Billing
                    </button>
                    <button onClick={() => setActiveTab('settings')} className={classNames("w-full flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors", activeTab === 'settings' ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50")}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        Settings
                    </button>
                </nav>

                <div className="pt-6 border-t border-zinc-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                            {user?.email?.[0].toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                            <p className="text-xs text-zinc-500 truncate">{planName} Plan</p>
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
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            {activeTab === 'overview' && 'Dashboard'}
                            {activeTab === 'billing' && 'Billing & Plans'}
                            {activeTab === 'settings' && 'Settings'}
                        </h1>
                        <p className="text-zinc-400">
                            {activeTab === 'overview' && 'Manage your NymAI settings and integrations.'}
                            {activeTab === 'billing' && 'Manage your subscription and billing details.'}
                            {activeTab === 'settings' && 'Configure application preferences.'}
                        </p>
                    </div>
                    <button onClick={handleSignOut} className="md:hidden text-zinc-400 hover:text-white">
                        Sign Out
                    </button>
                </header>

                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                )}

                {/* BILLING TAB */}
                {activeTab === 'billing' && (
                    <div className="max-w-4xl space-y-8">
                        {/* Current Plan Status */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">Current Subscription</h2>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-white mb-1">{planName} Plan</p>
                                    <p className="text-zinc-400 text-sm">
                                        {subscription?.current_period_end
                                            ? `Renews on ${new Date(subscription.current_period_end).toLocaleDateString()}`
                                            : 'No active subscription'}
                                    </p>
                                </div>
                                {planName !== 'Free' && (
                                    <button
                                        onClick={handlePortal}
                                        disabled={processing}
                                        className="px-4 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700 hover:bg-zinc-700 transition-colors disabled:opacity-50"
                                    >
                                        {processing ? 'Loading...' : 'Manage Subscription'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Upgrade Options (Only if Free) */}
                        {planName === 'Free' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Pro Plan */}
                                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-amber-500/50 transition-colors relative group">
                                    <div className="absolute top-0 right-0 p-4">
                                        <span className="bg-amber-500/10 text-amber-500 text-xs px-2 py-1 rounded-full border border-amber-500/20">Popular</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
                                    <p className="text-3xl font-bold text-white mb-6">$10<span className="text-sm font-normal text-zinc-400">/month</span></p>
                                    <ul className="space-y-3 mb-8 text-zinc-400 text-sm">
                                        <li className="flex items-center gap-2"><span className="text-amber-500">✓</span> Unlimited redactions</li>
                                        <li className="flex items-center gap-2"><span className="text-amber-500">✓</span> Custom Regex Rules</li>
                                        <li className="flex items-center gap-2"><span className="text-amber-500">✓</span> Priority Support</li>
                                    </ul>
                                    <button
                                        onClick={() => handleCHECKOUT(PRICE_PRO)}
                                        disabled={processing}
                                        className="w-full py-3 bg-white text-zinc-900 rounded-lg font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50"
                                    >
                                        {processing ? 'Processing...' : 'Upgrade to Pro'}
                                    </button>
                                </div>

                                {/* Team Plan */}
                                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
                                    <h3 className="text-xl font-bold text-white mb-2">Team</h3>
                                    <p className="text-3xl font-bold text-white mb-6">$29<span className="text-sm font-normal text-zinc-400">/month</span></p>
                                    <ul className="space-y-3 mb-8 text-zinc-400 text-sm">
                                        <li className="flex items-center gap-2"><span className="text-white">✓</span> Everything in Pro</li>
                                        <li className="flex items-center gap-2"><span className="text-white">✓</span> Admin Dashboard</li>
                                        <li className="flex items-center gap-2"><span className="text-white">✓</span> Centralized Billing</li>
                                        <li className="flex items-center gap-2"><span className="text-white">✓</span> Audit Logs</li>
                                    </ul>
                                    <button
                                        onClick={() => handleCHECKOUT(PRICE_TEAM)}
                                        disabled={processing}
                                        className="w-full py-3 bg-zinc-800 text-white border border-zinc-700 rounded-lg font-semibold hover:bg-zinc-700 transition-colors disabled:opacity-50"
                                    >
                                        {processing ? 'Processing...' : 'Upgrade to Team'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Placeholder for settings tab content */}
                        {activeTab === 'settings' && (
                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center text-zinc-500">
                                Settings content coming soon.
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
