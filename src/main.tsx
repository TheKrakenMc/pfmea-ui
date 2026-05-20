import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './i18n/i18n'          // Initialize i18n before rendering
import './index.css'
import App from './App'
import { FlowchartProvider } from './context/FlowchartContext'
import { ThemeProvider } from './context/ThemeContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <FlowchartProvider>
        <App />
        <Toaster richColors position="top-right" />
      </FlowchartProvider>
    </ThemeProvider>
  </StrictMode>,
)
