export default function FeatureGrid() {
    const features = [
        {
            title: "Browser Guard",
            description: "Intercepts paste events in Chrome to prevent accidental leaks into ChatGPT, Claude, and other web apps.",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="4" />
                    <line x1="21.17" x2="12" y1="8" y2="8" />
                    <line x1="3.95" x2="8.54" y1="6.06" y2="14" />
                    <line x1="10.88" x2="15.46" y1="21.94" y2="14" />
                </svg>
            ),
            color: "text-blue-500"
        },
        {
            title: "IDE Guard",
            description: "Runs natively in VS Code to catch secrets before they are committed or shared in screen shares.",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <path d="m18 16 4-4-4-4" />
                    <path d="m6 8-4 4 4 4" />
                    <path d="m14.5 4-5 16" />
                </svg>
            ),
            color: "text-amber-500"
        },
        {
            title: "Local Processing",
            description: "All regex matching happens on your device. Your data never leaves your machine.",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                </svg>
            ),
            color: "text-green-500"
        }
    ];

    return (
        <section className="py-24 bg-zinc-950">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white mb-4">Complete Coverage</h2>
                    <p className="text-zinc-400 max-w-2xl mx-auto">
                        Whether you're coding in VS Code or pasting into a browser, NymAI has you covered.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, i) => (
                        <div key={i} className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl hover:border-amber-500/50 transition-colors duration-300">
                            <div className={`w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center mb-6 ${feature.color}`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
