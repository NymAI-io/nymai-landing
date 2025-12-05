
import React, { useState } from 'react';

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
);

const Pricing: React.FC = () => {
  const [isPro, setIsPro] = useState(true);

  return (
    <section id="pricing" className="py-20 sm:py-28 container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white">Choose Your Plan</h2>
        <p className="max-w-2xl mx-auto mt-4 text-lg text-gray-400">Start for free or unlock the full power of NymAI for professional use.</p>
      </div>

      <div className="flex justify-center mb-12">
        <div className="bg-brand-glass p-1.5 rounded-xl flex items-center space-x-2">
          <button 
            onClick={() => setIsPro(false)}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${!isPro ? 'bg-brand-teal text-brand-dark' : 'text-gray-400 hover:text-white'}`}
          >
            Free
          </button>
          <button 
            onClick={() => setIsPro(true)}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${isPro ? 'bg-brand-teal text-brand-dark' : 'text-gray-400 hover:text-white'}`}
          >
            Pro
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <div className={`p-8 rounded-2xl transition-all duration-300 ${!isPro ? 'border-2 border-brand-teal bg-brand-glass' : 'bg-brand-glass border border-brand-glass-border'}`}>
          <h3 className="text-2xl font-bold text-white">Explorer</h3>
          <p className="text-gray-400 mb-6">For casual, everyday use.</p>
          <p className="text-4xl font-extrabold text-white mb-6">Free</p>
          <ul className="space-y-4 text-gray-300">
            <li className="flex items-start gap-3">
              <CheckIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <span>10 Daily Credits<sup className="text-xs text-gray-500 ml-1">*</sup></span>
            </li>
            <li className="text-xs text-gray-500 ml-8 -mt-2">
              <sup>*</sup>Text & Image = 1 Credit. Video = 5 Credits.
            </li>
            <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-400" /> Basic AI detection</li>
            <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-400" /> Text & Image analysis</li>
          </ul>
        </div>
        
        {/* Pro Plan */}
        <div className={`p-8 rounded-2xl transition-all duration-300 ${isPro ? 'border-2 border-brand-teal bg-brand-glass' : 'bg-brand-glass border border-brand-glass-border'}`}>
          <h3 className="text-2xl font-bold text-white">Professional</h3>
          <p className="text-gray-400 mb-6">For those who require absolute certainty.</p>
          <p className="text-4xl font-extrabold text-white mb-1">$9<span className="text-lg font-medium text-gray-400">/month</span></p>
          <p className="text-gray-400 mb-6">Billed annually</p>
          <ul className="space-y-4 text-gray-300">
            <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-400" /> Unlimited analyses</li>
            <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-400" /> Advanced AI detection</li>
            <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-400" /> Text, Image & Video analysis</li>
            <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-400" /> Full Source Verification</li>
            <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-400" /> Priority support</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
