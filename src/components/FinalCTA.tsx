
import React from 'react';
import { ChromeIcon } from './icons/ChromeIcon';

const FinalCTA: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 container mx-auto px-4 text-center">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white mb-6">
          Build a More Trustworthy Internet.
        </h2>
        <p className="text-lg md:text-xl text-gray-400 mb-10">
          Join us in our mission to bring clarity and truth back to the web. Install NymAI and start navigating the digital world with renewed confidence today.
        </p>
        <a
          href="#"
          className="bg-brand-teal text-brand-dark font-bold py-4 px-8 rounded-xl text-lg inline-flex items-center gap-3 hover:bg-brand-teal-light transition-colors shadow-lg shadow-brand-teal/20"
        >
          <ChromeIcon className="w-6 h-6" />
          Download for Chrome
        </a>
      </div>
    </section>
  );
};

export default FinalCTA;
