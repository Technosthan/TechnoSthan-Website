import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast'
import './index.css'
import './styles/PremiumDesign.css'
import './styles/FullyResponsive.css'
import './styles/GridLayouts.css'
import './styles/AdvancedLayouts.css'
import './styles/ResponseiveBreakpoints.css'

import { ToastProvider } from './component/Toast/ToastProvider.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3200,
          style: {
            borderRadius: '14px',
            background: '#0f172a',
            color: '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.08)',
          },
        }}
      />
      <App />
    </ToastProvider>
  </React.StrictMode>,
)
