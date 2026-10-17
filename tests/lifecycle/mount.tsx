// Test-only mounting controls; the production application has no global hooks.
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../../src/App';
import '../../src/index.css';
const root = createRoot(document.getElementById('root')!);
(window as any).mountFixtureApp = (enabled: boolean) => root.render(enabled ? <React.StrictMode><App /></React.StrictMode> : null);
(window as any).mountFixtureApp(true);
