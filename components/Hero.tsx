
import React from 'react';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { PuzzlePieceIcon } from './icons/PuzzlePieceIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ChromeIcon } from './icons/ChromeIcon';

const Hero: React.FC = () => {
  return (
    <section className="py-24 sm:py-32 text-center container mx-auto px-4">
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white mb-6">
        The Internet's <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-teal to-brand-teal-light">Trust Layer.</span>
      </h1>
      <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-400 mb-10">
        In a world of AI-generated content and misinformation, NymAI is your ground truth. Instantly verify the authenticity and credibility of any text, image, or video.
      </p>
      <div className="flex justify-center mb-12">
        <a
          href="#"
          className="bg-brand-teal text-brand-dark font-bold py-4 px-8 rounded-xl text-lg flex items-center gap-3 hover:bg-brand-teal-light transition-colors shadow-lg shadow-brand-teal/20"
        >
          <ChromeIcon className="w-6 h-6" />
          Download for Chrome
        </a>
      </div>
      <div className="flex justify-center items-center space-x-8 md:space-x-12 text-gray-400">
        <div className="flex items-center space-x-2">
          <ShieldCheckIcon className="w-5 h-5 text-brand-teal" />
          <span>Privacy First</span>
        </div>
        <div className="flex items-center space-x-2">
          <PuzzlePieceIcon className="w-5 h-5 text-brand-teal" />
          <span>Seamless Extension</span>
        </div>
        <div className="flex items-center space-x-2">
          <SparklesIcon className="w-5 h-5 text-yellow-400" />
          <span>Powered by Gemini</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
