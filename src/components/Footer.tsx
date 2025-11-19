
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-200 py-8">
      <div className="container mx-auto px-4 text-center text-gray-600">
        <div className="flex justify-center items-center gap-4 flex-wrap">
          <p>&copy; {new Date().getFullYear()} NymAI. All rights reserved.</p>
          <span className="text-gray-400">|</span>
          <a
            href="https://tally.so/r/GxxgYL"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900 transition-colors">
            Feedback
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
