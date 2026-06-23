import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { ToastProvider } from './context/ToastProvider';
import { LanguageProvider } from './context/LanguageProvider';
import { CatalogProvider } from './context/CatalogProvider';
import { FeedbackProvider } from './context/FeedbackProvider';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <ToastProvider>
          <CatalogProvider>
            <FeedbackProvider>
              <StoreProvider>
                <App />
              </StoreProvider>
            </FeedbackProvider>
          </CatalogProvider>
        </ToastProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);
