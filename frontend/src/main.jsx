
import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App.jsx';
import './index.css';
import './i18n'; // Import i18n configuration
import { initAnalyticsGate } from './utils/analytics';

axios.defaults.withCredentials = true;

const nativeFetch = window.fetch.bind(window);
window.fetch = (input, init = {}) => {
    const nextInit = {
        ...init,
        credentials: init.credentials || 'include'
    };
    return nativeFetch(input, nextInit);
};

initAnalyticsGate();

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <React.Suspense fallback="Loading...">
            <App />
        </React.Suspense>
    </React.StrictMode>,
);