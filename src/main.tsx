// Polyfills must be imported first for Safari compatibility
import './polyfills';

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './globals.css';
import { App } from './app';
import { initI18n } from './i18n/i18n';

async function bootstrap(): Promise<void> {
    await initI18n();

    ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}

void bootstrap();
