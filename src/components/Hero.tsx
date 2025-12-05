import Playground from './Playground';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* 
        Restored Visibility Fix
        - Removed mix-blend-mode (caused invisibility)
        - Kept elliptical shape for better aesthetics
        - Adjusted opacity for standard alpha blending
      */}

      {/* Layer 1: Wide, soft ambient orange glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(249, 115, 22, 0.15) 0%, rgba(24, 24, 27, 0) 70%)', // orange-500
          zIndex: 0,
        }}
      />

      {/* Layer 2: Focused, brighter amber core */}
      <div
        className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(251, 191, 36, 0.2) 0%, rgba(24, 24, 27, 0) 60%)', // amber-400
          zIndex: 0,
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-amber-500 text-xs font-medium mb-6 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            v4.0 Now Available
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-6 drop-shadow-2xl">
            The Privacy Firewall <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600">
              for Developers
            </span>
          </h1>

          <p className="text-xl text-zinc-400 mb-8 leading-relaxed max-w-2xl mx-auto">
            Stop accidental leaks before they happen. NymAI runs locally in VS Code and Chrome to catch API keys, PII, and secrets in real-time.
          </p>

          <div className="flex items-center justify-center gap-4">
            <button className="px-8 py-3 bg-white text-zinc-900 rounded-lg font-semibold hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]">
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
