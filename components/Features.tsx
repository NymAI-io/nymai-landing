
import React from 'react';
import { EyeIcon } from './icons/EyeIcon';
import { ClipboardCheckIcon } from './icons/ClipboardCheckIcon';
import { BarChartIcon } from './icons/BarChartIcon';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-brand-glass border border-brand-glass-border rounded-2xl p-8 backdrop-blur-lg">
        <div className="mb-4 inline-block p-3 bg-brand-teal/20 rounded-lg">
            {icon}
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400">{children}</p>
    </div>
);


const Features: React.FC = () => {
  return (
    <section id="features" className="py-20 sm:py-28 container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white">Your New Superpowers</h2>
        <p className="max-w-2xl mx-auto mt-4 text-lg text-gray-400">NymAI equips you with the tools to navigate the digital world with clarity and confidence.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard 
            icon={<EyeIcon className="w-7 h-7 text-brand-teal" />}
            title="See the Unseen"
        >
            Our advanced algorithms detect the subtle digital signatures of AI-generated content, revealing what's human-made and what's machine-generated with remarkable accuracy.
        </FeatureCard>
        <FeatureCard 
            icon={<ClipboardCheckIcon className="w-7 h-7 text-brand-teal" />}
            title="Verify, Don't Just Read"
        >
            Go beyond surface-level analysis. NymAI's Source Verification pipeline cross-references claims against live web data, giving you a real-time credibility score.
        </FeatureCard>
        <FeatureCard 
            icon={<BarChartIcon className="w-7 h-7 text-yellow-400" />}
            title="Act with Confidence"
        >
            Receive clear, concise, and actionable insights in a beautifully designed analysis panel. Understand content authenticity at a glance and make informed decisions.
        </FeatureCard>
      </div>
    </section>
  );
};

export default Features;
