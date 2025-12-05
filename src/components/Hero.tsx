import Playground from './Playground';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-zinc-900/0 to-zinc-900/0" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-amber-500 text-xs font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            v4.0 Now Available
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-6">
            The Privacy Firewall <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600">
              for Developers
            </span>
          </h1>

          <p className="text-xl text-zinc-400 mb-8 leading-relaxed">
            Stop accidental leaks before they happen. NymAI runs locally in VS Code and Chrome to catch API keys, PII, and secrets in real-time.
          </p>

          <div className="flex items-center justify-center gap-4">
            <button className="px-8 py-3 bg-white text-zinc-900 rounded-lg font-semibold hover:bg-zinc-200 transition-colors">
              Download Extension
            </button>
            <button className="px-8 py-3 bg-zinc-800 text-white rounded-lg font-semibold border border-zinc-700 hover:bg-zinc-700 transition-colors">
              View Documentation
            </button>
          </div>
        </div>

        <Playground />
      </div>
    </section>
  );
}
