import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast'
import './index.css'
import './styles/bhoomi.css'

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
            background: '#fffdf8',
            color: '#2f261f',
            border: '1px solid rgba(80, 61, 40, 0.12)',
          },
        }}
      />
      <App />
    </ToastProvider>
  </React.StrictMode>,
)
