import { useState } from 'react';

export default function Playground() {
    const [text, setText] = useState('');
    const [matches, setMatches] = useState<string[]>([]);

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newVal = e.target.value;
        setText(newVal);

        // Simple mock detection for demo purposes
        const detected = [];
        if (newVal.match(/sk-[a-zA-Z0-9]{20,}/)) detected.push('OpenAI API Key');
        if (newVal.match(/\d{4}-\d{4}-\d{4}-\d{4}/)) detected.push('Credit Card Number');

        setMatches(detected);
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl overflow-hidden">
            <div className="bg-zinc-950/50 border-b border-zinc-800 p-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
                <div className="ml-4 text-xs text-zinc-500 font-mono">demo.ts — NymAI Guard Active</div>
            </div>

            <div className="relative">
                <textarea
                    value={text}
                    onChange={handleInput}
                    placeholder="Try pasting an API key here (e.g. sk-12345...)"
                    className="w-full h-48 bg-zinc-900 text-zinc-300 p-4 font-mono text-sm focus:outline-none resize-none"
                    spellCheck={false}
                />

                {matches.length > 0 && (
                    <div className="absolute top-4 right-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl w-64 overflow-hidden">
                            <div className="bg-amber-500/10 border-b border-amber-500/20 p-2.5 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-amber-500">
                                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                                    <path d="M12 9v4" />
                                    <path d="M12 17h.01" />
                                </svg>
                                <span className="text-xs font-semibold text-amber-500">Sensitive Data Detected</span>
                            </div>
                            <div className="p-3 space-y-2">
                                {matches.map((m, i) => (
                                    <div key={i} className="text-xs text-zinc-400 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        {m}
                                    </div>
                                ))}
                                <button className="w-full mt-2 bg-red-600 hover:bg-red-500 text-white text-xs font-medium py-1.5 rounded transition-colors">
                                    Redact & Paste
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
