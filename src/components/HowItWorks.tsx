
import React from 'react';
import { MousePointerIcon } from './icons/MousePointerIcon';
import { CpuChipIcon } from './icons/CpuChipIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';

const Step: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; stepNumber: number }> = ({ icon, title, children, stepNumber }) => (
  <div className="relative flex flex-col items-center text-center">
    <div className="flex items-center justify-center w-16 h-16 bg-brand-glass border border-brand-glass-border rounded-full mb-4">
        {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-2">Step {stepNumber}: {title}</h3>
    <p className="text-gray-400 max-w-xs">{children}</p>
  </div>
);

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white">Three Steps to Clarity</h2>
        <p className="max-w-2xl mx-auto mt-4 text-lg text-gray-400">Our process is designed for simplicity and power, turning complex analysis into an effortless experience.</p>
      </div>
      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center space-y-12 md:space-y-0 md:space-x-8">
         <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-brand-glass-border" style={{ transform: 'translateY(-50%)' }}></div>
         <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-brand-teal to-brand-teal-light" style={{ transform: 'translateY(-50%)', width: '66%' }}></div>

        <Step icon={<MousePointerIcon className="w-8 h-8 text-brand-teal"/>} title="Select" stepNumber={1}>
          Activate our intuitive selection mode. Simply highlight any text, image, or video element on the page you want to analyze.
        </Step>
        
        <Step icon={<CpuChipIcon className="w-8 h-8 text-brand-teal"/>} title="Analyze" stepNumber={2}>
          With a single click, your selection is sent to our powerful analysis engine, "The Single Brain," for a multi-layered evaluation.
        </Step>
        
        <Step icon={<DocumentTextIcon className="w-8 h-8 text-yellow-400"/>} title="Understand" stepNumber={3}>
          View the results in the NymAI panel. Get a clear authenticity score, source verification, and a complete credibility report.
        </Step>
      </div>
    </section>
  );
};

export default HowItWorks;
