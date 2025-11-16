
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
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-gray-900">Choose Your Plan</h2>
        <p className="max-w-2xl mx-auto mt-4 text-lg text-gray-600">Start for free or unlock the full power of NymAI for professional use.</p>
      </div>

      <div className="flex justify-center mb-12">
        <div className="bg-gray-100 p-1.5 rounded-xl flex items-center space-x-2">
          <button 
            onClick={() => setIsPro(false)}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${!isPro ? 'bg-brand-teal text-brand-dark' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Free
          </button>
          <button 
            onClick={() => setIsPro(true)}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${isPro ? 'bg-brand-teal text-brand-dark' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Pro
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <div className={`p-8 rounded-2xl transition-all duration-300 ${!isPro ? 'border-2 border-brand-teal bg-white shadow-lg' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <h3 className="text-2xl font-bold text-gray-900">Explorer</h3>
          <p className="text-gray-600 mb-6">For casual, everyday use.</p>
          <p className="text-4xl font-extrabold text-gray-900 mb-6">Free</p>
          <ul className="space-y-4 text-gray-700">
            <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-400" /> 10 analyses per day</li>
            <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-400" /> Basic AI detection</li>
            <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-400" /> Text & Image analysis</li>
          </ul>
        </div>
        
        {/* Pro Plan */}
        <div className={`p-8 rounded-2xl transition-all duration-300 ${isPro ? 'border-2 border-brand-teal bg-white shadow-lg' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <h3 className="text-2xl font-bold text-gray-900">Professional</h3>
          <p className="text-gray-600 mb-6">Join the waitlist for exclusive early access.</p>
          <p className="text-4xl font-extrabold text-gray-900 mb-1">$9.99<span className="text-lg font-medium text-gray-500">/month</span></p>
          <p className="text-gray-600 mb-6">Coming Soon</p>
          <ul className="space-y-4 text-gray-700 mb-6">
            <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-400" /> Priority Access to NymAI Pro: Be the first to get the full feature set when it launches.</li>
            <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-400" /> Exclusive Launch Discount: Lock in a special discount for being an early supporter.</li>
            <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-400" /> Help Shape the Roadmap: Get a say in what new features we build next.</li>
          </ul>
          <button
            onClick={() => window.open('https://tally.so/r/444K1d', '_blank')}
            className="w-full py-3 bg-brand-teal hover:bg-brand-teal/90 text-brand-dark font-semibold rounded-lg transition-colors shadow-lg">
            Join the Pro Waitlist
          </button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
