import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { loadAppConfig } from './config/appConfig'
import { initializeApiConfig } from './services/axiosService'

async function bootstrap() {
  const rootElement = document.getElementById('root')!
  const root = createRoot(rootElement)

  try {
    const config = await loadAppConfig()
    initializeApiConfig(config.API_URL)

    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  } catch (error) {
    console.error('Failed to load application configuration from /config.json:', error)
    root.render(
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 p-6 text-slate-800">
        <div className="max-w-md rounded-xl border border-red-200 bg-white p-6 text-center shadow-lg">
          <h2 className="text-lg font-bold text-red-600 mb-2">Configuration Error</h2>
          <p className="text-sm text-slate-600 mb-4">
            Unable to load runtime configuration from <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">/config.json</code>. Please ensure the file exists and is accessible.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>,
    )
  }
}

bootstrap()
