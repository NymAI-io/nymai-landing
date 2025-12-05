import React, { useState, useRef, useEffect } from 'react';

const SENSITIVE_REGEX = /(sk-[a-zA-Z0-9\-_]{20,})|((?:sk|pk)_(?:test|live)_[a-zA-Z0-9]{24,})|(AKIA[0-9A-Z]{16})/g;

export default function Playground() {
    const [text, setText] = useState('');
    const [status, setStatus] = useState<'active' | 'redacted'>('active');
    const [flash, setFlash] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleCopyFakeKey = () => {
        const fakeKey = 'sk_test_51Mz982734982374982374982374';
        navigator.clipboard.writeText(fakeKey);
        // Optional: Show a toast or small indication that it was copied
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = e.target.value;

        if (SENSITIVE_REGEX.test(newText)) {
            // Match found - Redact immediately
            const redactedText = newText.replace(SENSITIVE_REGEX, '[REDACTED]');
            setText(redactedText);
            setStatus('redacted');
            setFlash(true);

            // Reset flash effect after animation
            setTimeout(() => setFlash(false), 1000);

            // Reset status after a delay if no more input? 
            // Or keep it as "Threat Neutralized" until cleared?
            // Keeping it simple for now, it stays "redacted" while the user types if they just pasted.
            // But if they clear it, we should probably reset.
        } else {
            setText(newText);
            if (newText === '') {
                setStatus('active');
            }
        }
    };

    // Effect to handle the "flash" animation on the container
    useEffect(() => {
        if (flash) {
            const timer = setTimeout(() => setFlash(false), 500);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    return (
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div
                className={`relative bg-zinc-900 rounded-xl border transition-all duration-300 overflow-hidden shadow-2xl ${flash ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'border-zinc-800 hover:border-zinc-700'
                    }`}
            >
                {/* Header */}
                <div className="bg-zinc-950/50 border-b border-zinc-800 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                            <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                        </div>
                        <span className="text-sm font-medium text-zinc-400">Try the Privacy Firewall</span>
                    </div>

                    {/* Status Indicator */}
                    <div className={`flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full border ${status === 'redacted'
                            ? 'bg-red-500/10 border-red-500/20 text-red-400'
                            : 'bg-green-500/10 border-green-500/20 text-green-400'
                        }`}>
                        {status === 'redacted' ? (
                            <>
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                                🛡️ THREAT NEUTRALIZED (Auto-Redacted)
                            </>
                        ) : (
                            <>
                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                🟢 System Monitor: Active
                            </>
                        )}
                    </div>
                </div>

                {/* Action Bar */}
                <div className="p-4 bg-zinc-900/50 border-b border-zinc-800 flex items-center justify-between">
                    <button
                        onClick={handleCopyFakeKey}
                        className="group flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded border border-zinc-700 transition-all active:scale-95"
                    >
                        <svg className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Step 1: Copy Fake Key
                    </button>
                    <span className="text-xs text-zinc-500 hidden sm:inline-block">
                        Matches Stripe, OpenAI, AWS keys
                    </span>
                </div>

                {/* Input Area */}
                <div className="relative">
                    <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={handleChange}
                        placeholder="Step 2: Paste the key here..."
                        className="w-full h-48 bg-zinc-950 text-zinc-300 p-6 font-mono text-sm focus:outline-none resize-none placeholder:text-zinc-600"
                        spellCheck={false}
                    />

                    {/* Watermark / Decoration */}
                    <div className="absolute bottom-4 right-4 pointer-events-none select-none opacity-20">
                        <svg className="w-16 h-16 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
