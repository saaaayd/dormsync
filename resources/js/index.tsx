import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Removed: import './styles/globals.css'; (Styles are now loaded via app.css)

const rootElement = document.getElementById('root');

if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}