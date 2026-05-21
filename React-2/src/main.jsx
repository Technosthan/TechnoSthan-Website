import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
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
      <App />
    </ToastProvider>
  </React.StrictMode>,
)
