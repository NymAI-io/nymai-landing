import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Helper for class names
function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

// Placeholder Price IDs - Replace with actual Stripe Price IDs
const PRICE_PRO = 'price_1SbOfmLuhBL6ZKLPnCG2h0Sk'; // e.g. price_1234
const PRICE_TEAM = 'price_1SbOgDLuhBL6ZKLPm0Fc4ITg'; // e.g. price_5678

// Default/Fallback Extension ID
const DEFAULT_EXTENSION_ID = "mabcbancmbiimlahjokigkgiaggfoppb";

export default function Dashboard() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [session, setSession] = useState<any>(null); // Track full session
    const [profile, setProfile] = useState<any>(null);
    const [subscription, setSubscription] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'billing'>('overview');
    const [processing, setProcessing] = useState(false);
    const [showSuccessSplash, setShowSuccessSplash] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [targetExtensionId, setTargetExtensionId] = useState<string>(DEFAULT_EXTENSION_ID);

    // Custom Rules State
    const [rules, setRules] = useState<any[]>([]);
    const [newRule, setNewRule] = useState({ name: '', regex_pattern: '' });
    const [ruleError, setRuleError] = useState('');

    useEffect(() => {
        checkUser();

        // 1. Resolve Extension ID from URL or LocalStorage or INJECTED GLOBAL
        const urlExtId = searchParams.get('ext_id');
        const storedExtId = localStorage.getItem('nym_extension_id');
        // @ts-ignore
        const injectedExtId = window.NYMAI_EXTENSION_ID;

        if (urlExtId) {
            console.log("Setting Extension ID from URL:", urlExtId);
            setTargetExtensionId(urlExtId);
            localStorage.setItem('nym_extension_id', urlExtId);
        } else if (injectedExtId) {
            console.log("Setting Extension ID from Injected Script:", injectedExtId);
            setTargetExtensionId(injectedExtId);
            localStorage.setItem('nym_extension_id', injectedExtId);
        } else if (storedExtId) {
            console.log("Using stored Extension ID:", storedExtId);
            setTargetExtensionId(storedExtId);
        }

        // Listener for dynamic injection (if script loads later)
        const handleExtensionReady = (e: any) => {
            const id = e.detail?.id;
            if (id) {
                console.log("Extension ID received via event:", id);
                setTargetExtensionId(id);
                localStorage.setItem('nym_extension_id', id);
            }
        };
        window.addEventListener('NYMAI_EXTENSION_ID_READY', handleExtensionReady);
        return () => window.removeEventListener('NYMAI_EXTENSION_ID_READY', handleExtensionReady);

    }, [searchParams]);

    // Fetch Rules when entering Settings tab
    useEffect(() => {
        if (activeTab === 'settings' && user) {
            fetchRules();
        }
    }, [activeTab, user]);

    async function fetchRules() {
        const { data, error } = await supabase
            .from('custom_rules')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching rules:', error);
        } else if (data) {
            setRules(data);
        }
    }

    // Sync Session with Chrome Extension
    useEffect(() => {
        const shouldForceSync = searchParams.get('force_sync') === 'true';

        // Only sync if we have a session and a target ID
        // Trigger if session exists OR if targetExtensionId just updated (and we have session)
        if (session && targetExtensionId) {
            if (window.chrome && window.chrome.runtime) {
                try {
                    // console.log('Attempting to sync session with extension:', targetExtensionId, shouldForceSync ? '(Forced)' : '');

                    window.chrome.runtime.sendMessage(targetExtensionId, {
                        type: 'AUTH_SYNC',
                        session: session
                    }, (response) => {
                        // Check for runtime error
                        if (window.chrome.runtime.lastError) {
                            // Silent fail initially
                            // console.debug('Extension sync failed:', window.chrome.runtime.lastError.message);
                        } else {
                            console.log('Extension sync successful:', response);
                            setShowSuccessSplash(true);
                            setCountdown(5);

                            // Clean up URL if forced
                            if (shouldForceSync || searchParams.get('ext_id')) {
                                const newParams = new URLSearchParams(searchParams);
                                newParams.delete('force_sync');
                                newParams.delete('ext_id');
                                setSearchParams(newParams);
                            }
                        }
                    });
                } catch (e) {
                    console.debug('Extension sync error:', e);
                }
            }
        }
    }, [session, targetExtensionId, searchParams, setSearchParams]);

    // Splash Screen Timer
    useEffect(() => {
        if (showSuccessSplash && countdown > 0) {
            const timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (showSuccessSplash && countdown === 0) {
            setShowSuccessSplash(false);
        }
    }, [showSuccessSplash, countdown]);

    async function checkUser() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/login');
                return;
            }

            setUser(session.user);
            setSession(session);

            // Fetch Profile & Subscription
            const [profileRes, subRes] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', session.user.id).single(),
                supabase.from('subscriptions').select('*').eq('user_id', session.user.id).single()
            ]);

            if (profileRes.data) setProfile(profileRes.data);
            if (subRes.data) setSubscription(subRes.data);

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



    // Custom Rules Handlers
    async function handleAddRule() {
        // Tier Check
        const isFree = planName === 'Free';
        if (isFree) {
            alert("Upgrade to Pro to add custom rules.");
            return;
        }

        // Validation
        if (!newRule.name || !newRule.regex_pattern) {
            setRuleError("Name and Pattern are required.");
            return;
        }

        try {
            new RegExp(newRule.regex_pattern);
        } catch (e) {
            setRuleError("Invalid Regex Pattern.");
            return;
        }
        setRuleError('');
        setProcessing(true);

        const { error } = await supabase.from('custom_rules').insert([
            { user_id: user.id, name: newRule.name, regex_pattern: newRule.regex_pattern }
        ]);

        if (error) {
            console.error('Error adding rule:', error);
            setRuleError('Failed to save rule.');
        } else {
            setNewRule({ name: '', regex_pattern: '' });
            fetchRules();
        }
        setProcessing(false);
    }

    async function handleDeleteRule(id: string) {
        if (!confirm('Are you sure you want to delete this rule?')) return;

        const { error } = await supabase.from('custom_rules').delete().eq('id', id);
        if (error) {
            console.error('Error deleting rule:', error);
            alert('Failed to delete rule.');
        } else {
            setRules(rules.filter(r => r.id !== id));
        }
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

    // UI Helpers for Settings
    const isFreeTier = planName === 'Free';

    return (
        <div className="min-h-screen bg-zinc-950 flex font-sans text-zinc-100">
            {/* Success Splash Screen */}
            {showSuccessSplash && (
                <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <div className="flex flex-col items-center gap-6 text-center p-8 max-w-md">
                        {/* Animated Checkmark */}
                        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-500">
                            <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Extension Connected Successfully</h1>
                            <p className="text-zinc-400 text-lg">Your browser is now protected.<br />You can safely close this tab.</p>
                        </div>

                        <div className="mt-8 flex flex-col gap-4 w-full">
                            <p className="text-zinc-500 text-sm font-medium">Redirecting to Dashboard in {countdown}s...</p>
                            <button
                                onClick={() => setShowSuccessSplash(false)}
                                className="w-full py-3 px-4 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors font-medium"
                            >
                                Go to Dashboard Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                    </div>
                )}

                {/* Settings Content for CUSTOM RULES */}
                {activeTab === 'settings' && (
                    <div className="max-w-4xl space-y-6">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
                            {/* Header */}
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-white">Custom Redaction Rules</h2>
                                <p className="text-zinc-400 text-sm">Define custom regex patterns to be redacted automatically.</p>
                            </div>

                            {/* Free Tier Overlay */}
                            {isFreeTier && (
                                <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                                    <div className="p-3 bg-zinc-800 rounded-full mb-3 shadow-lg border border-zinc-700">
                                        <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-1">Pro Feature</h3>
                                    <p className="text-zinc-400 text-sm max-w-xs mb-4">Upgrade to Pro to create unlimited custom redaction rules.</p>
                                    <button
                                        onClick={() => setActiveTab('billing')}
                                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors"
                                    >
                                        View Plans
                                    </button>
                                </div>
                            )}

                            {/* Rules List */}
                            <div className="space-y-3 mb-8">
                                {rules.length === 0 ? (
                                    <div className="text-center py-8 border border-dashed border-zinc-800 rounded-lg">
                                        <p className="text-zinc-500 text-sm">No custom rules yet.</p>
                                    </div>
                                ) : (
                                    rules.map((rule) => (
                                        <div key={rule.id} className="flex items-center justify-between bg-zinc-950/50 border border-zinc-800/50 p-3 rounded-lg group hover:border-zinc-700 transition-colors">
                                            <div>
                                                <h4 className="font-medium text-zinc-200 text-sm">{rule.name}</h4>
                                                <code className="text-xs text-amber-500 font-mono mt-0.5 block">{rule.regex_pattern}</code>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteRule(rule.id)}
                                                className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                                disabled={isFreeTier || processing}
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Add Rule Form */}
                            <div className="pt-6 border-t border-zinc-800">
                                <h3 className="text-sm font-medium text-white mb-4">Add New Rule</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-xs text-zinc-500 mb-1.5 font-medium">Rule Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Project IDs"
                                            value={newRule.name}
                                            onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors placeholder:text-zinc-600"
                                            disabled={isFreeTier || processing}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-zinc-500 mb-1.5 font-medium">Regex Pattern</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. PROJ-\d{4}"
                                            value={newRule.regex_pattern}
                                            onChange={(e) => setNewRule({ ...newRule, regex_pattern: e.target.value })}
                                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500 transition-colors placeholder:text-zinc-600"
                                            disabled={isFreeTier || processing}
                                        />
                                    </div>
                                </div>

                                {ruleError && (
                                    <p className="text-red-400 text-xs mb-3">{ruleError}</p>
                                )}

                                <div className="flex justify-end">
                                    <button
                                        onClick={handleAddRule}
                                        disabled={isFreeTier || processing}
                                        className="px-4 py-2 bg-white text-zinc-950 font-medium text-sm rounded-lg hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {processing ? 'Saving...' : 'Add Rule'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
