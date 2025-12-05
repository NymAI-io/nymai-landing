import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

function initApp() {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Could not find root element to mount to. Ensure <div id="root"></div> exists in index.html');
    return;
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Handle both cases: DOM already loaded or still loading
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  // DOM is already loaded, execute immediately
  initApp();
}
