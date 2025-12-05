
import React from 'react';
import { ChromeIcon } from './icons/ChromeIcon';

const Header: React.FC = () => {
  return (
    <header className="py-6 px-4 sm:px-6 lg:px-8 sticky top-0 z-50 bg-brand-dark/50 backdrop-blur-lg border-b border-brand-glass-border">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <img src="/nymai-wordmark.svg" alt="NymAI" className="h-8" />
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</a>
          <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a>
        </nav>
        <a
          href="#"
          className="bg-brand-teal text-brand-dark font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-brand-teal-light transition-colors"
        >
          <ChromeIcon className="w-5 h-5" />
          <span>Download for Chrome</span>
        </a>
      </div>
    </header>
  );
};

export default Header;
