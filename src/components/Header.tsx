import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-6 px-4 sm:px-6 lg:px-8 sticky top-0 z-50 bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-800">
      <div className="container mx-auto flex justify-between items-center">
        <a href="/" className="flex items-center gap-2">
          {/* Replaced img with text logo for now to avoid missing asset issues, or keep img if it exists in public */}
          {/* <img src="/NymAI_full_logo.svg" alt="NymAI Logo" className="h-10" /> */}
          <span className="text-xl font-bold text-white tracking-tight">NymAI</span>
        </a>
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-zinc-400 hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="text-zinc-400 hover:text-white transition-colors">How It Works</a>
          <a href="#pricing" className="text-zinc-400 hover:text-white transition-colors">Pricing</a>
        </nav>
        <a
          href="#"
          className="bg-white text-zinc-900 font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-zinc-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 19.5a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" />
          </svg>
          <span>Download for Chrome</span>
        </a>
      </div>
    </header>
  );
};

export default Header;
