import React, { useState, useRef, useEffect } from 'react';

const SENSITIVE_REGEX = /(sk-[a-zA-Z0-9\-_]{20,})|((?:sk|pk)_(?:test|live)_[a-zA-Z0-9]{24,})|(AKIA[0-9A-Z]{16})/g;

export default function Playground() {
    const [text, setText] = useState('');
    const [showToast, setShowToast] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleCopyFakeKey = () => {
        const fakeKey = 'sk_test_51Mz982734982374982374982374';
        navigator.clipboard.writeText(fakeKey);
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
            setShowToast(true);

            // Hide toast after 3 seconds
            setTimeout(() => setShowToast(false), 3000);
        } else {
            setText(newText);
        }
    };

    // Generate line numbers based on text content
    const lineCount = text.split('\n').length;
    const lines = Array.from({ length: Math.max(lineCount, 10) }, (_, i) => i + 1);

    return (
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Control Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                <div className="text-center sm:text-left">
                    <h3 className="text-xl font-bold text-white mb-1">Try the Privacy Firewall</h3>
                    <p className="text-zinc-400 text-sm">See how NymAI protects your code in real-time.</p>
                </div>
                <div className="flex items-center gap-3 bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                    <button
                        onClick={handleCopyFakeKey}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-900 text-sm font-bold rounded transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Step 1: Copy Toxic Key
                    </button>
                    <span className="text-zinc-500 text-sm font-medium hidden sm:inline-block">
                        Step 2: Paste below
                    </span>
                </div>
            </div>

            {/* VS Code Window */}
            <div className="rounded-lg overflow-hidden shadow-2xl bg-[#1e1e1e] border border-[#333] font-mono text-sm relative group">

                {/* Title Bar */}
                <div className="bg-[#252526] h-10 flex items-center px-4 select-none">
                    <div className="flex gap-2 mr-4">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                        <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                    </div>
                    <div className="flex-1 flex justify-center">
                        <div className="bg-[#1e1e1e] px-4 py-2 rounded-t-lg text-[#e7e7e7] text-xs flex items-center gap-2 min-w-[150px] justify-center relative top-1">
                            <span className="text-[#e7c02c]">TS</span>
                            secret_config.ts
                            <span className="ml-2 w-2 h-2 rounded-full bg-white/20 hover:bg-white/40 cursor-pointer" />
                        </div>
                    </div>
                    <div className="w-16" /> {/* Spacer for balance */}
                </div>

                {/* Editor Area */}
                <div className="flex relative min-h-[300px]">
                    {/* Gutter */}
                    <div className="w-12 bg-[#1e1e1e] text-[#858585] text-right pr-3 pt-4 select-none border-r border-[#333]/0">
                        {lines.map(line => (
                            <div key={line} className="leading-6">{line}</div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            value={text}
                            onChange={handleChange}
                            placeholder="// Paste your secret key here..."
                            className="w-full h-full bg-transparent text-[#d4d4d4] p-4 leading-6 focus:outline-none resize-none font-mono caret-white"
                            spellCheck={false}
                        />
                    </div>

                    {/* Toast Notification */}
                    {showToast && (
                        <div className="absolute bottom-4 right-4 bg-[#252526] border border-[#454545] shadow-xl rounded w-80 animate-in slide-in-from-right-10 duration-300 z-10">
                            <div className="flex items-center justify-between p-3 border-b border-[#454545]">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#3794ff]" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm0-10v6h2V7h-2z" />
                                    </svg>
                                    <span className="text-xs font-semibold text-[#cccccc]">NymAI</span>
                                </div>
                                <button
                                    onClick={() => setShowToast(false)}
                                    className="text-[#cccccc] hover:text-white"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="p-4 flex gap-3">
                                <div className="text-[#cccccc] text-sm">
                                    <p className="font-semibold mb-1">Secret Redacted</p>
                                    <p className="text-xs text-[#999999]">
                                        NymAI detected a potential secret and neutralized it before it could be pasted.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button className="px-3 py-1 bg-[#0e639c] hover:bg-[#1177bb] text-white text-xs rounded transition-colors whitespace-nowrap">
                                        View Log
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Status Bar */}
                <div className="bg-[#007acc] h-6 flex items-center justify-between px-3 text-white text-[11px] select-none">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            main*
                        </div>
                        <div className="flex items-center gap-1">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="10" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-4m0-4h.01" />
                            </svg>
                            0 Problems
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span>Ln {lineCount}, Col {text.length + 1}</span>
                        <span>UTF-8</span>
                        <span>TypeScript</span>
                        <div className="flex items-center gap-1">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                            NymAI Active
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
