
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-brand-glass-border py-8">
      <div className="container mx-auto px-4 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} NymAI. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
