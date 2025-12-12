import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import mermaid from 'mermaid';

// Initialize mermaid
mermaid.initialize({ startOnLoad: false, theme: 'dark' });
// Attach to window for the MermaidChart component to access
// @ts-ignore
window.mermaid = mermaid;

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);